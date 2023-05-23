import { css } from '@emotion/react';
import { TypescaleData } from 'theme-core';

/** Style utility that applies a min-width and min-height to be at least equal to
 *  given fontData's `lineHeight`. */
export const cssFontDataBoxStyle = ({ lineHeight }: TypescaleData) =>
  cssBoxStyle(lineHeight);

/** Applies a min-width and height equal to `boxSize` */
export const cssBoxStyle = (boxSize: number | undefined) => {
  return css({
    position: 'relative',
    minWidth: boxSize != null ? `${boxSize}px` : undefined,
    minHeight: boxSize != null ? `${boxSize}px` : undefined,
  });
};
