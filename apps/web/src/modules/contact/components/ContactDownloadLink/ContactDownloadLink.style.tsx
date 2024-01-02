import { css, Theme } from '@emotion/react';
import { UI } from 'next-ui';


/** The actual button style itself */
export const btn = (t: Theme) =>
  css({
    transition: `${UI.baseTransitionMs}ms`,
    padding: t.rt.multipliers.spacing('md'),
    border: `2px dashed ${t.sys.color.scheme.outlineVariant}`,
    borderRadius: t.rt.multipliers.roundness('md'),
    ':hover': {
      cursor: 'pointer',
      opacity: 1,
      border: `2px dashed ${t.sys.color.scheme.primary}`,
      '*': {
        color: t.sys.color.scheme.primary,
      },
    },
  });