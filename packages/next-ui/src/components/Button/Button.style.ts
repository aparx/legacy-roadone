import { UI } from '../../utils';
import { IconStyle } from '../Icon';
import type { ButtonOptions } from './Button';
import { css, Theme } from '@emotion/react';
import type { Property } from 'csstype';
import type { MultiStateKeyUnion } from 'theme-core';
import { typescalePinpoint } from 'theme-core';

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
  const fontData = typescalePinpoint(t, opts.font);
  return css`
    // TODO change to transparent and add/fix touch events
    -webkit-tap-highlight-color: ${t.sys.color.state[style.state].light};

    // <==> UNIVERSAL STYLE <==>
    display: block; // <- very important for anchor tags
    appearance: unset;
    border: none;
    padding: 0;
    cursor: default;
    color: transparent;
    width: fit-content;
    height: fit-content;
    border-radius: ${rt.multipliers.roundness(opts.roundness ?? 0)}px;
    text-decoration: none;
    user-select: none;

    & > div {
      // state-layer
      padding: ${rt.multipliers.spacing(opts.vPadding)}px
        ${rt.multipliers.spacing(opts.hPadding)}px;
      border-radius: inherit;

      & > div {
        // Apply icon style on button no matter what
        ${IconStyle.wrapper(fontData)}
      }
    }

    // <==> NON-DISABLED STYLE <==>
    &:not([disabled]) {
      cursor: pointer;
      color: ${style.foreground};
      background: ${style.background};

      & > div {
        // state-layer
        transition: background ${UI.baseTransitionMs}ms;
      }

      // :hover, :focus-visible
      &:hover > div,
      &:focus-visible > div {
        // state-layer
        background: ${t.sys.color.state[style.state].light};
      }

      // :pressed
      &[data-pressed='true'] > div,
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
