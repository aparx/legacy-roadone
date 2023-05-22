import { css, Theme } from '@emotion/react';

export const replyTextField = (theme: Theme) => css`
  & label:not([aria-disabled='true']):not(:active):not(:focus-within) {
    background: ${theme.sys.color.surface[3]};
  }
`;
