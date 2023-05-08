import { css, Theme } from '@emotion/react';
import { UI } from 'next-ui';

export const gig = (theme: Theme) =>
  css({
    borderRadius: theme.rt.multipliers.roundness(UI.generalRoundness),
    background: theme.sys.color.surface[2],
    overflow: 'hidden',
  });
