import { css } from '@emotion/react';
import { TypescaleData } from 'theme-core';

/** The wrapper style is per-se not limited to icons. */
export const wrapper = (fontData: TypescaleData) =>
  css({
    minWidth: `${fontData.lineHeight}px`,
    minHeight: `${fontData.lineHeight}px`,
    fontSize: `${fontData.fontSize}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  });
