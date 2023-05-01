/** @jsxImportSource @emotion/react */
import {
  HTMLElementFromTag,
  HTMLTag,
  HTMLTagRenderer,
  propMerge,
  WithTagRepresentation,
} from '../../utils';
import { StackConfig as config } from './Stack.config';
import * as style from './Stack.style';
import { jsx, useTheme } from '@emotion/react';
import { Property } from 'csstype';
import { ForwardedRef, forwardRef, ReactNode } from 'react';

export type StackDirection = Property.FlexDirection;

export type InternalStackProps = {
  children: NonNullable<ReactNode> | NonNullable<ReactNode>[];
  /** @default horizontal */
  direction?: StackDirection;
  /** @default 1 */
  spacing?: number;
};

// prettier-ignore
export type StackProps<TTag extends HTMLTag> =
  WithTagRepresentation<TTag, InternalStackProps>;

export const Stack = forwardRef(function StackRenderer<TTag extends HTMLTag>(
  { as, children, direction, spacing, ...restProps }: StackProps<TTag>,
  ref: ForwardedRef<HTMLElementFromTag<TTag>>
) {
  const _style = style.stack(useTheme(), direction, spacing);
  return jsx(
    as ?? config.Defaults.tag,
    propMerge({ css: _style, ref }, restProps),
    children
  );
}) as HTMLTagRenderer<typeof config.Defaults.tag, InternalStackProps>;
export default Stack;
