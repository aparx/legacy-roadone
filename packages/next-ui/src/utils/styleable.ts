import { UI } from './magics';
import { propMerge } from './merge';
import type { MultiplierValueInput } from './types';
import type { Theme } from '@emotion/react';
import { useTheme } from '@emotion/react';
import type { Property } from 'csstype';
import { capitalize } from 'lodash';
import { CSSProperties } from 'react';
import type { ValueSource } from 'shared-utils';
import { resolveSource } from 'shared-utils';
import { BreakpointName } from 'theme-core';

import QuadSides = BoxSide.QuadSides;

export type OptionalColor = Property.Color | undefined | null;

export type StyleableColorProps = {
  background?: ValueSource<OptionalColor, [Theme]>;
  color?: ValueSource<OptionalColor, [Theme]>;
  border?: ValueSource<Property.Border, [Theme]>;
};

export type StyleableDimensionProps = {
  /** when applied, lengthens <strong>every</strong> child up to given width. */
  childLength?: BreakpointName;
  width?: ValueSource<Property.Width, [Theme]>;
  height?: ValueSource<Property.Height, [Theme]>;
  fit?: ValueSource<boolean, [Theme]>;
};

export module BoxSide {
  export const quadHorizontals = ['left', 'right'] as const;
  export const quadVerticals = ['top', 'bottom'] as const;
  export type QuadHorizontals = (typeof quadHorizontals)[number];
  export type QuadVerticals = (typeof quadVerticals)[number];
  export const quadSides = [...quadHorizontals, ...quadVerticals] as const;
  export type QuadSides = (typeof quadSides)[number];
  // prettier-ignore
  /** Array of all sides in order of lowest to highest precedence */
  export const fullSides = [
    'h', ...quadHorizontals, 'v', ...quadVerticals,
  ] as const;
  export type FullSides = (typeof fullSides)[number];

  /** Object with mappings of all full exclusive sides to quad sides. */
  export const fullToQuadMap: Record<
    Exclude<FullSides, QuadSides>,
    readonly QuadSides[]
  > = {
    v: ['top', 'bottom'] as const,
    h: ['left', 'right'] as const,
  };

  // prettier-ignore
  export type PrefixedQuadSides<TPrefix extends string> =
    `${TPrefix}${Capitalize<QuadSides>}`;

  // prettier-ignore
  export type PrefixedQuadSideMap<TPrefix extends string, TValue> =
    Record<PrefixedQuadSides<TPrefix>, TValue>;

  // prettier-ignore
  export type PrefixedFullSideMap<TPrefix extends string, TValue> =
    Record<`${TPrefix}${Capitalize<FullSides>}`, TValue>

  // prettier-ignore
  export type PrefixedQuadSideInclusiveMap<TPrefix extends string, TValue> =
    PrefixedQuadSideMap<TPrefix, TValue> & Record<TPrefix, TValue>;

  // prettier-ignore
  export type PrefixedFullSidesInclusiveMap<TPrefix extends string, TValue> =
    PrefixedFullSideMap<TPrefix, TValue> & Record<TPrefix, TValue>;

  /** Quad types whose prefixed non-inclusive types can be used in raw CSS */
  export type StyleableQuadTypes = (typeof styleableQuadTypes)[number];

  export const styleableQuadTypes = ['padding', 'margin'] as const;

  // prettier-ignore
  export type PrefixedFullInclusiveMappedSide<TType extends string> =
    _PrefixedInclusiveMapping<TType, QuadSides[]>;
  // prettier-ignore
  type _PrefixedInclusiveMapping<TType extends string, TElement> =
    BoxSide.PrefixedFullSidesInclusiveMap<TType, readonly TElement[]>;

  export const prefixedFullToQuadMap: {
    [TType in StyleableQuadTypes]: PrefixedFullInclusiveMappedSide<TType>;
  } = {} as any;
  // Filling up all styleable quad types within `prefixedFullToQuadMap`
  styleableQuadTypes.forEach((t) => {
    prefixedFullToQuadMap[t as any] = createPrefixedFullInclusiveSideMap(t);
  });

  export function createPrefixedFullInclusiveSideMap<
    TType extends StyleableQuadTypes
  >(type: TType) {
    const output: Partial<PrefixedFullInclusiveMappedSide<TType>> = {};
    BoxSide.fullSides.forEach((key) => {
      output[`${type}${capitalize(key) as Capitalize<typeof key>}`] =
        key in BoxSide.fullToQuadMap
          ? BoxSide.fullToQuadMap[key]
          : [key as QuadSides];
    });
    output[type] = BoxSide.quadSides as any;
    return output as PrefixedFullInclusiveMappedSide<TType>;
  }
}

export type StyleableSpacingProps = Partial<_InclusiveSpacingProps>;
type _InclusiveSpacingProps<_TValue = MultiplierValueInput<'spacing'>> =
  BoxSide.PrefixedFullSidesInclusiveMap<'margin', _TValue> &
    BoxSide.PrefixedFullSidesInclusiveMap<'padding', _TValue>;

export type StyleableNumericProps = {
  opacity?: ValueSource<number, [Theme]>;
  roundness?: MultiplierValueInput<'roundness'>;
};

/** Properties used on custom components to apply basic style per usage. */
export type StyleableData = StyleableColorProps &
  StyleableNumericProps &
  StyleableDimensionProps &
  StyleableSpacingProps;

/** Object with the `styleablePropKey` and `StyleableData` as value. */
export type StyleableProp = { [UI.styleablePropKey]?: StyleableData };

// prettier-ignore
/** Returns a new type of `TProps` with the styleable property. */
export type PropsWithStyleable<TProps> =
  Omit<TProps, keyof StyleableProp> & StyleableProp;

type OptionalData = StyleableData | undefined | null;

export function useStyleableProps(data: OptionalData) {
  return createStyleableProps(useTheme(), data);
}

export function createStyleableProps(theme: Theme, data: OptionalData) {
  return data
    ? {
        style: createInlineStyle(theme, data),
        css: createEmotionStyle(theme, data),
      }
    : {};
}

/** Merges the props resulting from given styleable and the leftover props. */
export function useStyleableMerge({ sd, ...rest }: StyleableProp & object) {
  const styleable = useStyleableProps(sd); // all props from `styleable`
  return rest ? propMerge(styleable, rest) : styleable;
}

function createInlineStyle(theme: Theme, data: StyleableData) {
  const { multipliers } = theme.rt;
  const mapper = (v: MultiplierValueInput<'spacing'>) => multipliers.spacing(v);
  return {
    background: data.background && resolveSource(data.background, theme),
    color: data.color && resolveSource(data.color, theme),
    border: data.border && resolveSource(data.border, theme),
    opacity: data.opacity && resolveSource(data.opacity, theme),
    borderRadius: multipliers.roundness(data.roundness),
    ...toPartialPrefixedQuadSides('margin', data, mapper),
    ...toPartialPrefixedQuadSides('padding', data, mapper),
    width: data.fit ? 'fit-content' : resolveSource(data.width, theme),
    height: data.fit ? 'fit-content' : resolveSource(data.height, theme),
  } satisfies CSSProperties;
}

function createEmotionStyle(theme: Theme, { childLength }: StyleableData) {
  const { breakpoints } = theme.rt;
  return childLength
    ? {
        '& > *': {
          width: '100%',
          maxWidth: breakpoints.point(childLength),
        },
      }
    : undefined;
}

function toPartialPrefixedQuadSides<
  TType extends BoxSide.StyleableQuadTypes,
  TValIn,
  TValOut,
  TObj
>(
  type: TType,
  data: Partial<BoxSide.PrefixedFullSidesInclusiveMap<TType, TValIn>> & TObj,
  mapper: (value: TValIn, type: TType) => TValOut
): Partial<BoxSide.PrefixedQuadSideMap<TType, TValOut>> {
  if (Object.keys(data).length === 0) return {};
  const output: Partial<BoxSide.PrefixedQuadSideMap<TType, TValOut>> = {};
  const sideMap = BoxSide.prefixedFullToQuadMap[type];
  Object.keys(sideMap)
    .filter((key) => key in data)
    .map((key) => [mapper(data[key], type), sideMap[key]])
    .forEach(([value, targets]) =>
      (targets as readonly QuadSides[])
        .map((key) => `${type}${capitalize(key)}`)
        .forEach((key) => (output[key] = value))
    );
  return output;
}
