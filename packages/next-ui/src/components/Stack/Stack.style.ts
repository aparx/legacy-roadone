import { StackDirection } from './Stack';
import { css, Theme } from '@emotion/react';

export const stack = (
  theme: Theme,
  direction: StackDirection,
  spacing: number
) => {
  return css({
    display: 'flex',
    flexDirection: direction,
    gap: theme.ref.multipliers.spacing * spacing,
  });
};
