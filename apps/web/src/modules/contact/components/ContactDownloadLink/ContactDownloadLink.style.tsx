import { css, Theme } from '@emotion/react';
import { UI } from 'next-ui';

/** The actual button style itself */
export const btn = (t: Theme) =>
  css({
    transition: `${UI.baseTransitionMs}ms`,
    padding: t.rt.multipliers.spacing('lg'),
    border: `1px dashed ${t.sys.color.scheme.outlineVariant}`,
    borderRadius: t.rt.multipliers.roundness('md'),
    background: t.sys.color.surface[2],
    ':hover': {
      cursor: 'pointer',
      opacity: 1,
      borderColor: t.sys.color.scheme.secondary,
      background: t.sys.color.surface[3],
      '*': {
        color: t.sys.color.scheme.secondary,
      },
    },
  });
