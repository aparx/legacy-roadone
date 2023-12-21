import { css, Theme } from '@emotion/react';

export const style = (theme: Theme) =>
  css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: theme.sys.color.surface[2],
    padding: theme.rt.multipliers.spacing('lg'),
    borderRadius: theme.rt.multipliers.roundness('md'),
    border: `solid ${theme.sys.color.surface[4]} 1px`,
    height: '100%',
    overflow: 'hidden',
    textDecoration: 'none',
    ':hover': {
      borderColor: theme.sys.color.state.surface.strong,
      // inner card state
      '> *:first-child': {
        background: theme.sys.color.state.surface.light,
      },
      // inner gradient state
      '.gradient > *': {
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${theme.sys.color.state.surface.light})`,
      },
    },
    // The gradient covering the "rest" of the title & text
    '.gradient': {
      position: 'absolute',
      background: `linear-gradient(90deg, transparent, ${theme.sys.color.surface[2]})`,
      width: 100,
      height: '100%',
      top: 0,
      right: 0,
    },
  });
