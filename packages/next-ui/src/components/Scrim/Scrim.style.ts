import { ScrimConfig as config } from './Scrim.config';
import { css } from '@emotion/react';
import { Theme } from 'theme-core';

export const scrim = (theme: Theme) =>
  css({
    position: 'fixed',
    inset: 0,
    background: theme.sys.color.scheme.scrim,
    opacity: 0.5,
    zIndex: config.zIndex,
  });
