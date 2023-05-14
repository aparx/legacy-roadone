import { UI } from '../../utils';
import { IconConfig } from '../Icon';
import { css, Theme } from '@emotion/react';
import { TypescaleData } from 'theme-core';

export const shell = (
  t: Theme,
  {
    error,
    fontData,
    disabled,
    showLeading,
    leadingIconId,
  }: {
    error: boolean;
    disabled: boolean | undefined;
    fontData: TypescaleData;
    showLeading: boolean;
    leadingIconId: string;
    tailingIconId: string;
  }
) => {
  const fgBase = error
    ? t.sys.color.scheme.onErrorContainer
    : t.sys.color.scheme.onSurface;
  const bgBase = error
    ? t.sys.color.scheme.errorContainer
    : t.sys.color.scheme.surfaceVariant;
  return css`
    & label {
      // actual (visible) field wrapping
      background: transparent;
      color: ${disabled
        ? t.rt.emphasis.emphasize(fgBase, 'disabled')
        : t.rt.emphasis.emphasize(fgBase, 'medium')};
      border-radius: ${t.rt.multipliers.roundness(UI.generalRoundness)}px;
      overflow: hidden;
      box-sizing: border-box;
      outline: solid ${bgBase} 1px;
      transition: background-color ${UI.baseTransitionMs}ms;
      & * {
        transition-property: background-color, outline-color;
        transition-duration: ${UI.baseTransitionMs}ms;
        transition-timing-function: linear;
      }

      & > div {
        // state-layer
        background: ${disabled ? t.sys.color.state.disabled : 'transparent'};

        & > * {
          padding: ${t.rt.multipliers.spacing(1)}px;
        }

        & > [${IconConfig.identifyHTMLAttribute}] {
          font-size: ${fontData.fontSize * 1.15}px !important;
        }

        & > [${IconConfig.identifyHTMLAttribute}='${leadingIconId}'] {
          background: ${bgBase};
        }

        & input {
          border: unset;
          box-shadow: unset;
          outline: unset;
          background: unset;
          overflow: hidden;
          color: inherit;
          width: 100%;

          &::placeholder {
            color: inherit;
          }
        }
      }

      &:focus-within {
        background: ${t.sys.color.scheme.secondaryContainer};
        color: ${t.sys.color.scheme.onSecondaryContainer};
        border-color: ${t.sys.color.scheme.primary};
        outline-color: ${t.sys.color.scheme.primary};
        & > div {
          // state-layer
          & [${IconConfig.identifyHTMLAttribute}='${leadingIconId}'] {
            background-color: ${t.sys.color.scheme.primary};
            color: ${t.sys.color.scheme.onPrimary};
          }
        }
      }

      &:not([aria-disabled='true']):hover {
        & > div {
          // state-layer
          background: ${t.sys.color.state.surface.light};
        }
      }
    } // END OF LABEL
  `;
};
