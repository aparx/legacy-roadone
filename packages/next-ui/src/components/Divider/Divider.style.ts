import type { DividerData } from './Divider';
import { css, Theme } from '@emotion/react';

export const divider = (
  t: Theme,
  { length, orientation, thickness, emphasis }: DividerData
) =>
  css({
    [orientation === 'horizontal' ? 'width' : 'height']: length,
    [orientation === 'horizontal' ? 'height' : 'width']: thickness,
    background: t.sys.color.scheme.surfaceVariant,
    opacity: t.rt.emphasis.alpha(emphasis),
  });
