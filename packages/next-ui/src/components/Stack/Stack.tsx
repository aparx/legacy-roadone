/** @jsxImportSource @emotion/react */
import type { MultiplierValueInput } from '../../utils';
import {
  HTMLElementFromTag,
  HTMLTag,
  HTMLTagRenderer,
  propMerge,
  PropsWithStyleable,
  useStyleableMerge,
  WithTagRepresentation,
} from '../../utils';
import { StackConfig as config } from './Stack.config';
import * as style from './Stack.style';
import { jsx, Theme, useTheme } from '@emotion/react';
import type { Globals, Property } from 'csstype';
import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from 'react';
import { UnionExclude } from 'shared-utils';

export type StackDirection = UnionExclude<Property.FlexDirection, Globals>;

export type StackCenter =
  | undefined
  | boolean
  | Property.AlignItems
  | Property.JustifyContent;

export type StackData = {
  /** @default horizontal */
  direction: StackDirection;
  /** @default 'nowrap' */
  wrap?: boolean | Property.FlexWrap;
  /** Gap before multiplier. Overridden by `rowSpacing` and/or `columnSpacing`.
   *  @default 1*/
  spacing?: MultiplierValueInput<'spacing'>;
  vSpacing?: MultiplierValueInput<'spacing'>;
  hSpacing?: MultiplierValueInput<'spacing'>;
  vAlign?: StackCenter;
  hAlign?: StackCenter;
};

export type InternalStackProps = PropsWithStyleable<
  Partial<StackData> & {
    children?: ReactNode | ReactNode[];
    /** Spacer that sits between every Stack-Item. */
    spacer?: ReactNode;
  }
>;

// prettier-ignore
export type StackProps<TTag extends HTMLTag> =
  WithTagRepresentation<TTag, InternalStackProps>;

export const Stack = forwardRef(function StackRenderer<TTag extends HTMLTag>(
  {
    as,
    children,
    direction,
    spacing,
    wrap,
    vAlign,
    hAlign,
    hSpacing,
    vSpacing,
    spacer,
    ...rest
  }: StackProps<TTag>,
  ref: ForwardedRef<HTMLElementFromTag<TTag>>
) {
  if (spacer && Array.isArray(children)) {
    children = children.flatMap((child, idx, array) => {
      return 1 + idx < array.length ? [child, spacer] : child;
    });
  }
  return jsx(
    as ?? config.Defaults.tag,
    propMerge(
      useStackProps({
        direction,
        spacing,
        vAlign,
        hAlign,
        wrap,
        hSpacing: hSpacing,
        vSpacing: vSpacing,
      }),
      useStyleableMerge(rest),
      { ref }
    ),
    children
  );
}) as HTMLTagRenderer<typeof config.Defaults.tag, InternalStackProps>;
export default Stack;

export function useStackProps(data: Partial<StackData>) {
  return createStackProps(useTheme(), data);
}

export function createStackProps(
  theme: Theme,
  {
    direction = config.Defaults.direction,
    spacing = config.Defaults.spacing,
    wrap = config.Defaults.wrap,
    vSpacing,
    hSpacing,
    vAlign,
    hAlign,
  }: Partial<StackData>
) {
  return {
    css: style.stack(theme, { direction, vAlign, hAlign, wrap }),
    // Since spacing is not bound to any limits, we ensure to not create
    // unnecessary amounts of class merges, thus using inline style instead
    style:
      vSpacing != null || hSpacing != null
        ? ({
            columnGap:
              hSpacing != null
                ? theme.rt.multipliers.spacing(hSpacing)
                : undefined,
            rowGap:
              vSpacing != null
                ? theme.rt.multipliers.spacing(vSpacing)
                : undefined,
          } satisfies CSSProperties)
        : { gap: theme.rt.multipliers.spacing(spacing) },
  };
}
