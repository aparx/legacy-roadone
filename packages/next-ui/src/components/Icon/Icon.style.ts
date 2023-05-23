import { StyleUtils } from '../../utils';
import { css } from '@emotion/react';
import { TypescaleData } from 'theme-core';

/** The wrapper style is per-se not limited to icons. */
export const wrapper = (fontData: TypescaleData) => [
  StyleUtils.BoxStyle.cssBoxStyle(fontData.lineHeight),
  css({
    fontSize: `${fontData.fontSize}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
];
