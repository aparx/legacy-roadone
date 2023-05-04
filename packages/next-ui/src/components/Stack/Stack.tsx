/** @jsxImportSource @emotion/react */
import {
  HTMLElementFromTag,
  HTMLTag,
  HTMLTagRenderer,
  propMerge,
  WithTagRepresentation,
} from '../../utils';
import { useStyleableMerge, WithStyleableProp } from '../../utils/styleable';
import type { MultiplierValueInput } from '../../utils/types';
import { RequiredChildren } from '../../utils/types';
import { StackConfig as config } from './Stack.config';
import * as style from './Stack.style';
import { jsx, Theme, useTheme } from '@emotion/react';
import type { Globals, Property } from 'csstype';
import React, { ForwardedRef, forwardRef } from 'react';
import { UnionOmit } from 'shared-utils';

export type StackDirection = UnionOmit<Property.FlexDirection, Globals>;

export type StackCenter =
  | undefined
  | boolean
  | Property.AlignItems
  | Property.JustifyContent;

export type StackData = {
  /** @default horizontal */
  direction: StackDirection;
  /** @default 1 */
  spacing: MultiplierValueInput<'spacing'>;
  vCenter?: StackCenter;
  hCenter?: StackCenter;
};

export type InternalStackProps = WithStyleableProp<
  Partial<StackData> & { children: RequiredChildren }
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
    vCenter,
    hCenter,
    ...rest
  }: StackProps<TTag>,
  ref: ForwardedRef<HTMLElementFromTag<TTag>>
) {
  return jsx(
    as ?? config.Defaults.tag,
    propMerge(
      useStackProps({ direction, spacing, vCenter, hCenter }),
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
    vCenter,
    hCenter,
  }: Partial<StackData>
) {
  return {
    css: style.stack(theme, { direction, vCenter, hCenter }),
    // Since spacing is not bound to any limits, we ensure to not create
    // unnecessary amounts of class merges, thus using inline style instead
    style: { gap: theme.rt.multipliers.spacing(spacing) },
  };
}
