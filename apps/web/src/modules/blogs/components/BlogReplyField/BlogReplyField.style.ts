import { css, Theme } from '@emotion/react';
import { StyleUtils, UI } from 'next-ui';
import { TypescaleData } from 'theme-core';

export const replyTextField = (theme: Theme) => css`
  & label:not([aria-disabled='true']):not(:active):not(:focus-within) {
    background: ${theme.sys.color.surface[3]};
  }
`;

/** Outer field wrapper, that is used for a field that is supposed to have the user
 *  sign-in in order to reply. */
export const loginField = (t: Theme, fontData: TypescaleData) => {
  return css`
    ${StyleUtils.BoxStyle.cssFontDataBoxStyle(fontData)}
    border: 1px solid ${t.sys.color.scheme.surfaceVariant};
    border-radius: ${t.rt.multipliers.roundness(UI.generalRoundness)}px;
  `;
};
