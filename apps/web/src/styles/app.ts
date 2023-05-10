import { css, Theme } from '@emotion/react';

/** The app root style, generally used to alter its contents. */
export const appRoot = css({});

/** The general global style, that applies to the body */
export const appGlobal = ({ sys }: Theme) =>
  css`
    html,
    body {
      color: ${sys.color.scheme.onSurface};
      background: ${sys.color.scheme.background} !important;
    }
  `;
