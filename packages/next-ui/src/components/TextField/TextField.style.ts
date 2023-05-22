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

      & > .state-layer {
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

        & input,
        & textarea {
          border: unset;
          box-shadow: unset;
          outline: unset;
          background: unset;
          overflow: hidden;
          color: inherit;
          width: 100%;
          resize: none;
          min-height: ${fontData.lineHeight}px;

          &::placeholder {
            color: ${t.rt.emphasis.emphasize(fgBase, 'low')};
          }
        }

        & textarea {
          font: unset;
          min-height: ${(fontData.lineHeight ?? 0) * 4}px;
        }
      }

      &:focus-within {
        background: ${t.sys.color.scheme.secondaryContainer};
        color: ${t.sys.color.scheme.onSecondaryContainer};
        border-color: ${t.sys.color.scheme.primary};
        outline-color: ${t.sys.color.scheme.primary};
        & > .state-layer {
          // state-layer
          & [${IconConfig.identifyHTMLAttribute}='${leadingIconId}'] {
            background-color: ${t.sys.color.scheme.primary};
            color: ${t.sys.color.scheme.onPrimary};
          }
        }
      }

      &:not([aria-disabled='true']):hover {
        & > .state-layer {
          // state-layer
          background: ${t.sys.color.state.surface.light};
        }
      }
    } // END OF LABEL
  `;
};

/** Style for the asterisk used to display an urge of requirement */
export const asterisk = (t: Theme) =>
  css({
    color: t.rt.emphasis.emphasize(t.sys.color.scheme.onSurface, 'low'),
  });
