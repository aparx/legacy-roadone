/** @jsxImportSource @emotion/react */
import { UIMagics } from '../../utils';
import type { InferRtMultiplierNameMap } from '../../utils/types';
import { ButtonConfig as config } from './Button.config';
import { createButtonRenderer } from './Button.renderer';
import { mainButton } from './variations/mainButton';
import { textButton } from './variations/textButton';
import { capitalize } from 'lodash';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import {
  MultiplierOperationInput,
  palettePrimaryArray,
  TypescalePinpoint,
} from 'theme-core';

/** Union of all button sizes */
export type ButtonSize = (typeof buttonSizeArray)[number];

export const buttonSizeArray = ['md', 'sm'] as const;

/** Union of all available button types */
export type ButtonType = (typeof buttonTypeArray)[number];

// prettier-ignore
export const buttonTypeArray = [
  ...palettePrimaryArray, 'surface', 'text'
] as const;

export interface ButtonOptions {
  font: TypescalePinpoint;
  roundness?: MultiplierOperationInput<'roundness', InferRtMultiplierNameMap>;
  hPadding: MultiplierOperationInput<'spacing', InferRtMultiplierNameMap>;
  vPadding: MultiplierOperationInput<'spacing', InferRtMultiplierNameMap>;
}

type ButtonAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
type ButtonElementProps = ButtonHTMLAttributes<HTMLButtonElement>;

export type BiasedButtonProps =
  | ({ link: string } & ButtonAnchorProps)
  | ({ link?: undefined } & ButtonElementProps);

export type InternalButtonProps = {
  disabled?: boolean;
  /** @default 'sm' */
  size?: ButtonSize;
  evenPadding?: boolean;
  leading?: ReactNode;
  tailing?: ReactNode;
  [UIMagics.customStyleProperty]?: Partial<ButtonOptions>;
};

export type ButtonProps = InternalButtonProps &
  Omit<BiasedButtonProps, keyof InternalButtonProps>;

// In order for LSP to recognize the Text type, we have to export it.
export type Button = Record<
  Capitalize<ButtonType>,
  ReturnType<typeof createButtonRenderer>
>;

// <===> BUTTON OPTION MODULES <===>
// here we are able to add more button "option modules"
type _ModuleMap<T extends ButtonType> = {
  [P in T]: config.External.ButtonAppearanceModule<[...any, P, ...any]>;
};
const moduleArray = [mainButton(), textButton()];
const _modules: Partial<_ModuleMap<ButtonType>> = {};
moduleArray.forEach((m) => m.types.forEach((type) => (_modules[type] = m)));

// <===> BUTTON COMPONENT DECL. <===>

const _button: Partial<Button> = {};
/** Fills current `_button` object with all necessary type components */
buttonTypeArray.forEach((rawType) => {
  const map = _modules[rawType]; // map of all sizes to options for `rawType`
  if (!map) throw new Error(`[Button] missing options for ${rawType}`);
  _button[capitalize(rawType) as Capitalize<typeof rawType>] =
    createButtonRenderer(rawType, map[rawType], map._factory);
});

export const Button = _button as Readonly<Button>;
export default Button;
