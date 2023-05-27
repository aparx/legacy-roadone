import { css, keyframes, Theme } from '@emotion/react';
import { UI } from 'next-ui';

const fadeDurationMultiplier = 0.1; /* 10% */

const progressFrames = keyframes`
  from { width: 100% }
  90% { opacity: 100%; }
  to { width: 0; opacity: 0; }
`;

const toastFrames = keyframes`
  from { opacity: 0; transform: translateX(-5%) }
  5%, 90% { opacity: 1; transform: unset; }
  95%, to { opacity: 0; transform: translateX(-5%) }
`;

export const toast = (
  theme: Theme,
  data: {
    background: string;
    foreground: string;
    /** Time in seconds */
    duration: number;
  }
) =>
  css({
    boxShadow: `${
      theme.sys.color.elevation[1]
    } 0 0 ${theme.rt.multipliers.spacing('lg')}px`,
    position: 'relative',
    overflow: 'hidden',
    padding: theme.rt.multipliers.spacing('lg'),
    background: data.background,
    color: data.foreground,
    borderRadius: `${theme.rt.multipliers.roundness(UI.generalRoundness)}px`,
    animation: `${toastFrames} ${data.duration}s ease-in-out forwards`,
    '&::after': {
      content: '""',
      position: 'absolute',
      background: data.foreground,
      width: '100%',
      height: 3,
      bottom: 0,
      left: 0,
      transition: 'width 2s',
      animation: `${progressFrames} ${Math.max(
        data.duration - data.duration * fadeDurationMultiplier,
        0
      )}s linear forwards`,
    },
  });
