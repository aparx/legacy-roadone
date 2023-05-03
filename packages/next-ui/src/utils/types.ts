import type { Theme } from '@emotion/react';
import { WithConditionalCSSProp } from '@emotion/react/types/jsx-namespace';
import { ReactNode } from 'react';
import type {
  DynamicMultiplierName,
  MultiplierOperationInput,
} from 'theme-core';

export type InferRtMultiplierNameMap =
  Theme['rt']['multipliers']['nameInputMap'];

export type MultiplierValueInput<TType extends DynamicMultiplierName> =
  MultiplierOperationInput<TType, InferRtMultiplierNameMap>;

export type RequiredChildren =
  | NonNullable<ReactNode>
  | NonNullable<ReactNode>[];

export type WithCSSProp<TProps> = TProps & WithConditionalCSSProp<TProps>;
