import { StyleUtils, UI } from '../../utils';
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
  const { rt } = t;
  const fontData = typescalePinpoint(t, opts.font);
  const roundness = rt.multipliers.roundness(opts.roundness ?? 0);
  const baseBoxV = `${rt.multipliers.spacing(opts.vPadding)}px`;
  const baseBoxH = `${rt.multipliers.spacing(opts.hPadding)}px`;
  const isOutOfFlowPaddingH = opts.hPaddingMode === 'oof';
  const isOutOfFlowPaddingV = opts.vPaddingMode === 'oof';
  // Physical padding for the actual `padding` css-property
  const realPaddingV = isOutOfFlowPaddingV ? 'unset' : baseBoxV;
  const realPaddingH = isOutOfFlowPaddingH ? 'unset' : baseBoxH;
  // Simulated "out-of-flow" padding for the `box-shadow` css-property
  const boxShadowPadding = (color: unknown) => {
    const shadow: string[] = [];
    if (isOutOfFlowPaddingH)
      shadow.push(`-${baseBoxH} 0 ${color}`, `${baseBoxH} 0 ${color}`);
    if (isOutOfFlowPaddingV)
      shadow.push(`0 -${baseBoxV} ${color}`, `0 ${baseBoxV} ${color}`);
    return shadow.length === 0 ? 'unset' : shadow.join(', ');
  };
  const showBackground = style.background !== 'transparent';
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
    border-radius: ${roundness}px;
    text-decoration: none;
    user-select: none;

    & > div {
      // state-layer
      padding-top: ${realPaddingV};
      padding-bottom: ${realPaddingV};
      padding-left: ${realPaddingH};
      padding-right: ${realPaddingH};
      border-radius: inherit;

      & > div {
        ${StyleUtils.BoxStyle.cssFontDataBoxStyle(fontData)}
      }
    }

    // <==> NON-DISABLED STYLE <==>
    &:not([disabled]) {
      cursor: pointer;
      color: ${style.foreground};
      background: ${style.background};

      & > div {
        // state-layer
        transition: all ${UI.baseTransitionMs}ms;
        box-shadow: ${boxShadowPadding(style.background)};
      }

      // :hover, :focus-visible
      &:hover > div,
      &:focus-visible > div {
        // state-layer
        background: ${t.sys.color.state[style.state].light};
        box-shadow: ${boxShadowPadding(t.sys.color.state[style.state].light)};
      }

      // :pressed
      &[data-pressed='true'] > div,
      &:active > div {
        // state-layer
        background: ${t.sys.color.state[style.state].medium};
        box-shadow: ${boxShadowPadding(t.sys.color.state[style.state].medium)};
      }
    }

    // <==> DISABLED STYLE <==>
    &[disabled],
    &[aria-disabled='true'] {
      // TODO no disabled background color if background is transparent
      color: ${t.sys.color.scheme.onSurface};
      background: ${showBackground ? t.sys.color.state.disabled : 'unset'};
      box-shadow: ${showBackground
        ? boxShadowPadding(t.sys.color.state.disabled)
        : 'unset'};
      pointer-events: none;
    }
  `;
};
