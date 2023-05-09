/** @jsxImportSource @emotion/react */
import { useTypefaceStyleClass } from '../../context';
import type { HTMLTag } from '../../utils';
import {
  HTMLElementFromTag,
  HTMLTagRenderer,
  propMerge,
  UI,
  WithTagRepresentation,
} from '../../utils';
import { PropsWithStyleable, useStyleableMerge } from '../../utils/styleable';
import { PropsWithCSS } from '../../utils/types';
import { TextConfig as config } from './Text.config';
import { css, jsx, useTheme } from '@emotion/react';
import { colord } from 'colord';
import { capitalize } from 'lodash';
import React, {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  PropsWithChildren,
} from 'react';
import { resolveSource, ValueSource } from 'shared-utils';
import type { Theme, TypescalePinpoint, TypescaleRole } from 'theme-core';
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
/** Internal props for any nested Text component. */
export type InternalTypeTextProps = PropsWithChildren<PropsWithStyleable<{
  size: TypescaleSize;
  /** @default initial */
  [UI.customStylePropKey]?: Partial<TypescaleData>;
} & TextStyleProps>>;

/** Text style data outside a React-Component, with given font data. */
export type TextStyleData = { fontData: TypescaleData } & TextStyleProps;

// prettier-ignore
export type TextTypeProps<TTag extends HTMLTag> =
  WithTagRepresentation<TTag, InternalTypeTextProps>;

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
    props: TextTypeProps<TTag>,
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
  }) as HTMLTagRenderer<typeof config.Defaults.tag, InternalTypeTextProps>;
}

export function useFontData({ role, size }: TypescalePinpoint) {
  return useTheme().sys.typescale[role][size];
}

/** If `color` is given, only the alpha channel of the color is changed in the final
 *  style. If `color` is not given, the entire Text section will have an opacity set
 *  to given emphasis! TL;DR: set a color to avoid every child to have given emphasis! */
export function useDataTextProps({ fontData, color, emphasis }: TextStyleData) {
  const theme = useTheme();
  const newColor = resolveSource<InternalTypeTextProps['color']>(color, theme);
  const alpha = config.emphasisOpacityMap[emphasis ?? config.Defaults.emphasis];
  const alphaColor =
    newColor != null && newColor !== 'initial' && newColor !== 'inherit'
      ? colord(colord(newColor).alpha(alpha)).toHex()
      : undefined;
  return {
    className: useTypefaceStyleClass(fontData.fontFamily),
    style: {
      fontSize: `${fontData.fontSize / theme.ref.typeface.base.fontSize}rem`,
      color: alphaColor ?? newColor,
      opacity: !alphaColor ? alpha : 'initial',
    } satisfies CSSProperties,
    css: css({
      fontWeight: theme.ref.typeface.weights[fontData.fontWeight],
      lineHeight: `${fontData.lineHeight}px` ?? 'initial',
      letterSpacing: `${fontData.letterSpacing}px` ?? 'initial',
    }),
  } satisfies PropsWithCSS<HTMLAttributes<any>>;
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
