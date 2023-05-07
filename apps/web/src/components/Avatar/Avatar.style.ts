import { css, Theme } from '@emotion/react';

export const avatar = (theme: Theme, size: number) =>
  css({
    background: theme.sys.color.scheme.surfaceVariant,
    borderRadius: `${2 * size}px`,
    width: size,
    height: size,
  });
