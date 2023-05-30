import { UI } from '../../utils';
import { css, Theme } from '@emotion/react';
import type { BreakpointName } from 'theme-core';

export const card = (
  theme: Theme,
  width: BreakpointName | false,
  tight: boolean | undefined,
  keepPadding: boolean
) =>
  css({
    borderRadius: theme.rt.multipliers.roundness(UI.generalRoundness),
    background: theme.sys.color.surface[1],
    padding: theme.rt.multipliers.spacing(3),
    maxWidth: width !== false ? theme.rt.breakpoints.point(width) : undefined,
    width: width !== false && !tight ? '100%' : undefined,
    boxSizing: 'border-box',
    // prettier-ignore
    [theme.rt.breakpoints.lte('md')]: !keepPadding ? {
      padding: theme.rt.multipliers.spacing(1.75),
    } : undefined,
    // prettier-ignore
    [theme.rt.breakpoints.lte('sm')]: !keepPadding ? {
      padding: theme.rt.multipliers.spacing(1),
    } : undefined,
  });

export const header = (theme: Theme) =>
  css({
    marginBottom: `${theme.rt.multipliers.spacing(1)}px`,
  });

export const footer = (theme: Theme) =>
  css({
    marginTop: `${theme.rt.multipliers.spacing(2)}px`,
  });
