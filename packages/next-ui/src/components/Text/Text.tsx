/** @jsxImportSource @emotion/react */
import { useTypefaceStyleClass } from '../../context';
import { HTMLTagRenderer, UIMagics } from '../../utils';
import { propMerge } from '../../utils';
import type { HTMLTag } from '../../utils';
import { HTMLElementFromTag, WithTagRepresentation } from '../../utils/tag';
import { TextConfig as config } from './Text.config';
import { jsx, useTheme } from '@emotion/react';
import { capitalize } from 'lodash';
import React, {
  forwardRef,
  ReactNode,
  CSSProperties,
  HTMLAttributes,
} from 'react';
import { resolveSource, ValueSource } from 'shared-utils';
import type { Theme, TypescaleRole } from 'theme-core';
import { TypescaleData, typescaleRoleArray, TypescaleSize } from 'theme-core';

/** Props that is more thoroughly describing the style (not typography!) of the
 * text without requiring any information to what font (family) is used. */
export type TextStyleProps = {
  /** @default config.Defaults.emphasis */
  emphasis?: config.Emphasis;
  /** @default config.Defaults.color */
  color?: ValueSource<string, [Theme]>;
};

/** Internal props for the Text-Component. */
export type InternalTextProps = {
  children: NonNullable<ReactNode>[] | NonNullable<ReactNode>;
  size: TypescaleSize;
  /** @default high */
  /** @default initial */
  [UIMagics.customStyleProperty]?: Partial<TypescaleData>;
} & TextStyleProps;

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
    const fontData = { ...useTheme().sys.typescale[role][size], ...take };
    const styleProps = useTextElementProps({ fontData, emphasis, color });
    const propData = propMerge(styleProps, restProps);
    let defaultTag: HTMLTag | undefined;
    if (!as) defaultTag = config.tagMap[role]?.[size];
    defaultTag ??= config.Defaults.tag;
    return jsx(as ?? defaultTag, { ...propData, ref }, children);
  }) as HTMLTagRenderer<typeof config.Defaults.tag, InternalTextProps>;
}

export function createTextStyle(
  theme: Theme,
  {
    fontData,
    emphasis = config.Defaults.emphasis,
    color = config.Defaults.color,
  }: TextStyleData
) {
  return {
    fontWeight: theme.ref.typeface.weights[fontData.fontWeight],
    fontSize: `${fontData.fontSize / theme.ref.typeface.base.fontSize}rem`,
    lineHeight: `${fontData.lineHeight}px` ?? 'initial',
    letterSpacing: `${fontData.letterSpacing}px` ?? 'initial',
    color: resolveSource<InternalTextProps['color']>(color, theme),
    opacity: config.emphasisOpacityMap[emphasis],
  } satisfies CSSProperties;
}

export function useTextElementProps(data: TextStyleData) {
  return {
    style: createTextStyle(useTheme(), data),
    className: useTypefaceStyleClass(data.fontData.fontFamily),
  } satisfies HTMLAttributes<any>;
}
