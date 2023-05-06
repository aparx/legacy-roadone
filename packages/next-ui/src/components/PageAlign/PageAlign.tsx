/** @jsxImportSource @emotion/react */
import {
  HTMLElementFromTag,
  HTMLTag,
  HTMLTagRenderer,
  propMerge,
  WithTagRepresentation,
} from '../../utils';
import { useStyleableMerge, WithStyleableProp } from '../../utils/styleable';
import { RequiredChildren } from '../../utils/types';
import { PageAlignConfig as config } from './PageAlign.config';
import * as style from './PageAlign.style';
import { jsx, Theme, useTheme } from '@emotion/react';
import React, { ForwardedRef, forwardRef, ReactElement } from 'react';

export type BasePageAlignData = {
  /** @default maximum theme's breakpoint (px) */
  alignBy?: number;

  /** @default 'auto' (=> automatic determination) */
  lowerBound?: number | 'auto';
};

export type InternalPageAlignProps = WithStyleableProp<
  BasePageAlignData & { children: RequiredChildren }
>;

// prettier-ignore
export type PageProps<TTag extends HTMLTag> =
  WithTagRepresentation<TTag, InternalPageAlignProps>;

export const PageAlign = forwardRef(function PageAlignRenderer<
  TTag extends HTMLTag
>(
  { as, alignBy, lowerBound, children, ...restProps }: PageProps<TTag>,
  ref: ForwardedRef<HTMLElementFromTag<TTag>>
) {
  const theme = useTheme();
  return jsx(
    as ?? config.Defaults.tag,
    propMerge(
      createPageAlignProps(theme, { alignBy, lowerBound }),
      useStyleableMerge(restProps),
      { ref }
    ),
    children
  );
}) as HTMLTagRenderer<
  typeof config.Defaults.tag,
  InternalPageAlignProps,
  ReactElement
>;

export default PageAlign;

/** Hook that returns props used to align an element to the page flow. */
export function usePageAlignProps(data?: BasePageAlignData) {
  return createPageAlignProps(useTheme(), data);
}

/** Returns properties applied to an element to align it to the page flow. */
export function createPageAlignProps(theme: Theme, data?: BasePageAlignData) {
  return { css: createPageAlignStyle(theme, data) };
}

/** Returns the emotion-css property used to apply page alignment. */
export function createPageAlignStyle(theme: Theme, data?: BasePageAlignData) {
  return style.pageAlign(theme, {
    alignBy: data?.alignBy ?? theme.rt.breakpoints.point('xl'),
    lowerBound: data?.alignBy ?? 'auto',
  });
}

/** Returns the horizontal (!) CSS padding value for page alignment. */
export function createPageAlignPadding(width: number, lowerBound?: number) {
  return `max(${lowerBound ?? 0}px, calc(calc(100% - ${width}px) / 2))`;
}
