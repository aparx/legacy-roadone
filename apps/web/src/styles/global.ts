import { css, Theme } from '@emotion/react';

export const global = ({ sys }: Theme) =>
  css`
    html,
    body {
      color: ${sys.color.scheme.onSurface};
      background: ${sys.color.scheme.background} !important;
    }
  `;
