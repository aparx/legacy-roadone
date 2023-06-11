import { SpinnerData } from './Spinner';
import { css, keyframes, Theme } from '@emotion/react';
import { resolveSource } from 'shared-utils';

const spinnerKeyframes = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

export const spinner = (theme: Theme, data: SpinnerData) => {
  const innerThickness = data.size / 10;
  const innerMargin = 2 * innerThickness;
  const color = resolveSource(data.color, theme);
  return css({
    display: 'inline-block',
    position: 'relative',
    width: data.size,
    height: data.size,
    '& div': {
      boxSizing: 'border-box',
      display: 'block',
      position: 'absolute',
      width: data.size - innerThickness - innerMargin,
      height: data.size - innerThickness - innerMargin,
      margin: innerMargin,
      border: `${innerThickness}px solid ${color}`,
      borderColor: `${color} transparent transparent transparent`,
      borderRadius: '50%',
      animation: `${spinnerKeyframes} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite`,
    },
    '& div:nth-of-type(1)': {
      animationDelay: '-.45s',
    },
    '& div:nth-of-type(2)': {
      animationDelay: '-.3s',
    },
    '& div:nth-of-type(3)': {
      animationDelay: '-.15s',
    },
  });
};
