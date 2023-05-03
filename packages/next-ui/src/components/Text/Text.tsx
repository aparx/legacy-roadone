/** @jsxImportSource @emotion/react */
import { useTypefaceStyleClass } from '../../context';
import { HTMLTagRenderer, UIMagics } from '../../utils';
import { propMerge } from '../../utils';
import type { HTMLTag } from '../../utils';
import { useStyleableMerge, WithStyleableProp } from '../../utils/styleable';
import { HTMLElementFromTag, WithTagRepresentation } from '../../utils/tag';
import { WithCSSProp } from '../../utils/types';
import { TextConfig as config } from './Text.config';
import { css, jsx, useTheme } from '@emotion/react';
import { WithConditionalCSSProp } from '@emotion/react/types/jsx-namespace';
import { capitalize } from 'lodash';
import React, {
  forwardRef,
  ReactNode,
  CSSProperties,
  HTMLAttributes,
} from 'react';
import { resolveSource, ValueSource } from 'shared-utils';
import type {
  Theme,
  TypefaceWeight,
  TypescalePinpoint,
  TypescaleRole,
} from 'theme-core';
import { TypescaleData, typescaleRoleArray, TypescaleSize } from 'theme-core';

/** Props that is more thoroughly describing the style (not typography!) of the
 * text without requiring any information to what font (family) is used. */
export type TextStyleProps = {
  /** @default config.Defaults.emphasis */
  emphasis?: config.Emphasis;
  /** @default config.Defaults.color */
  color?: ValueSource<string, [Theme]>;
};

// prettier-ignore
/** Internal props for the Text-Component. */
export type InternalTextProps = WithStyleableProp<{
  children: NonNullable<ReactNode>[] | NonNullable<ReactNode>;
  size: TypescaleSize;
  /** @default initial */
  [UIMagics.customStylePropKey]?: Partial<TypescaleData>;
} & TextStyleProps>;

/** Text style data outside a React-Component, with given font data. */
export type TextStyleData = { fontData: TypescaleData } & TextStyleProps;

// prettier-ignore
export type TextProps<TTag extends HTMLTag> =
  WithTagRepresentation<TTag, InternalTextProps>;

// In order for LSP to recognize the Text type, we have to export it.
export type Text = Record<
  Capitalize<TypescaleRole>,
  ReturnType<typeof createTextRenderer>
>;

const _text: Partial<Text> = {};
/** Fills current `_Text` object with all necessary role components */
typescaleRoleArray.forEach((rawRole) => {
  const bigRole = capitalize(rawRole) as Capitalize<typeof rawRole>;
  (_text as Text)[bigRole] = createTextRenderer(rawRole);
});

export const Text = _text as Readonly<Text>;
export default Text;

function createTextRenderer(role: TypescaleRole) {
  return forwardRef(function TextRenderer<TTag extends HTMLTag>(
    props: TextProps<TTag>,
    ref: React.ForwardedRef<HTMLElementFromTag<TTag>>
  ) {
    const { as, children, size, take, color, emphasis, ...restProps } = props;
    const fontData = { ...useFontData({ role, size }), ...take };
    const propData = propMerge(
      useDataTextProps({ fontData, emphasis, color }),
      useStyleableMerge(restProps)
    );
    let defaultTag: HTMLTag | undefined;
    if (!as) defaultTag = config.tagMap[role]?.[size];
    defaultTag ??= config.Defaults.tag;
    return jsx(as ?? defaultTag, { ...propData, ref }, children);
  }) as HTMLTagRenderer<typeof config.Defaults.tag, InternalTextProps>;
}

function useFontData({ role, size }: TypescalePinpoint) {
  return useTheme().sys.typescale[role][size];
}

export function useDataTextProps({ fontData, color, emphasis }: TextStyleData) {
  const theme = useTheme();
  return {
    className: useTypefaceStyleClass(fontData.fontFamily),
    style: {
      fontSize: `${fontData.fontSize / theme.ref.typeface.base.fontSize}rem`,
      color: resolveSource<InternalTextProps['color']>(color, theme),
      opacity: config.emphasisOpacityMap[emphasis],
    } satisfies CSSProperties,
    css: css({
      fontWeight: theme.ref.typeface.weights[fontData.fontWeight],
      lineHeight: `${fontData.lineHeight}px` ?? 'initial',
      letterSpacing: `${fontData.letterSpacing}px` ?? 'initial',
    }),
  } satisfies WithCSSProp<HTMLAttributes<any>>;
}

export function usePinpointTextProps({
  role,
  size,
  ...restTypes
}: TypescalePinpoint & TextStyleProps) {
  return useDataTextProps({
    fontData: useFontData({ role, size }),
    ...restTypes,
  });
}
