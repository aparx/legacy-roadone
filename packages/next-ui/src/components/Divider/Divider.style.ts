import type { DividerData } from './Divider';
import { DividerConfig as config } from './Divider.config';
import { css, Theme } from '@emotion/react';

export const divider = (
  theme: Theme,
  {
    length = config.defaults.length,
    orientation = config.defaults.orientation,
    thickness = config.defaults.thickness,
  }: DividerData
) =>
  css({
    [orientation === 'horizontal' ? 'width' : 'height']: length,
    [orientation === 'horizontal' ? 'height' : 'width']: thickness,
    background: theme.sys.color.scheme.surfaceVariant,
  });
