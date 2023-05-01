import type { ButtonOptions } from './Button';
import { css, Theme } from '@emotion/react';
import type { Property } from 'csstype';
import type { MultiStateKeyUnion } from 'theme-core';

export type ButtonStyleInput = {
  background: Property.Background;
  foreground: Property.Color;
  state: MultiStateKeyUnion;
};

export const button = (
  t: Theme,
  opts: ButtonOptions,
  style: ButtonStyleInput
) => {
  const { sys, rt } = t;
  const { lineHeight } = sys.typescale[opts.font.role][opts.font.size];
  return css`
    // <==> UNIVERSAL STYLE <==>
    appearance: unset;
    border: none;
    padding: 0;
    cursor: default;
    background: none;
    color: transparent;
    width: fit-content;
    height: fit-content;
    border-radius: ${rt.multipliers.roundness(opts.roundness)}px;
    text-decoration: none;
    user-select: none;

    & > div {
      // state-layer
      padding: ${rt.multipliers.spacing(opts.vPadding)}px
        ${rt.multipliers.spacing(opts.hPadding)}px;
      border-radius: inherit;

      & > div {
        // button-item (icon / children)
        display: flex;
        justify-content: center;
        align-items: center;
        // Making sure we always have at least a minimum height (& width)
        min-height: ${lineHeight}px;
        min-width: ${lineHeight}px;
      }
    }

    // <==> NON-DISABLED STYLE <==>
    &:not([disabled]) {
      cursor: pointer;
      color: ${style.foreground};
      background: ${style.background};

      & > div {
        // state-layer
        transition: background 200ms;
      }

      // :hover, :focus-visible
      &:hover > div,
      &:focus-visible > div {
        // state-layer
        background: ${t.sys.color.state[style.state].light};
      }

      // :pressed
      &[data-pressed='true'],
      &:active > div {
        // state-layer
        background: ${t.sys.color.state[style.state].medium};
      }
    }

    // <==> DISABLED STYLE <==>
    &[disabled],
    &[aria-disabled='true'] {
      color: ${t.sys.color.scheme.onSurface};
      background: ${t.sys.color.state.disabled};
      pointer-events: none;
    }
  `;
};
