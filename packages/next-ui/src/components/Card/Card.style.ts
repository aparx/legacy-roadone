import { UI } from '../../utils';
import { css, Theme } from '@emotion/react';
import type { BreakpointName } from 'theme-core';

export const card = (theme: Theme, width: BreakpointName) =>
  css({
    borderRadius: theme.rt.multipliers.roundness(UI.generalRoundness),
    background: theme.sys.color.surface[1],
    padding: theme.rt.multipliers.spacing(3),
    maxWidth: theme.rt.breakpoints.point(width),
    width: '100%',
    boxSizing: 'border-box',
    [theme.rt.breakpoints.lte('md')]: {
      padding: theme.rt.multipliers.spacing(1.75),
    },
    [theme.rt.breakpoints.lte('sm')]: {
      padding: theme.rt.multipliers.spacing(1),
    },
  });

export const header = (theme: Theme) =>
  css({
    marginBottom: `${theme.rt.multipliers.spacing(1)}px`,
  });

export const footer = (theme: Theme) =>
  css({
    marginTop: `${theme.rt.multipliers.spacing(2)}px`,
  });
