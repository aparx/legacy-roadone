import { StyleUtils, UI } from '../../utils';
import { css, keyframes, Theme } from '@emotion/react';
import { TypescaleData } from 'theme-core';

const popoverKeyframes = keyframes({
  from: { opacity: 0 },
  '90%': { opacity: 0, transform: 'translateY(25%)' },
  to: { opacity: 1 },
});

/** The wrapper style is per-se not limited to icons. */
export const wrapper = (
  theme: Theme,
  fontData: TypescaleData,
  popup?: string
) => [
  StyleUtils.BoxStyle.cssBoxStyle(fontData.lineHeight),
  css({
    fontSize: `${fontData.fontSize}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    cursor: popup ? 'help' : undefined,
    '&:hover': {
      '&::before': {
        content: `"${popup}"`,
        pointerEvents: 'none',
        position: 'absolute',
        display: 'block',
        whiteSpace: 'nowrap',
        width: 'fit-content',
        fontSize: '90%',
        background: theme.sys.color.scheme.surfaceVariant,
        color: theme.sys.color.scheme.onSurfaceVariant,
        border: `1px solid ${theme.sys.color.scheme.primary}`,
        boxShadow: `0px 0px 10px ${theme.sys.color.elevation[1]}`,
        bottom: '100%',
        padding: '.25em .5em',
        borderRadius: theme.rt.multipliers.roundness(UI.generalRoundness),
        animation: `.75s ${popoverKeyframes} ease-in forwards`,
      },
    },
  }),
];
