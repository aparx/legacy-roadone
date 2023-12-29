import type { Theme } from '@emotion/react';
import { WithConditionalCSSProp } from '@emotion/react/types/jsx-namespace';
import { PropsWithoutRef, ReactNode, RefAttributes } from 'react';
import type { MultiplierName, MultiplierOperationInput } from 'theme-core';

export type InferRtMultiplierNameMap =
  Theme['rt']['multipliers']['nameInputMap'];

export type MultiplierValueInput<TType extends MultiplierName> =
  MultiplierOperationInput<TType, InferRtMultiplierNameMap>;

export type OptionalChildren =
  | ReactNode
  | (ReactNode | undefined | null)[]
  | undefined
  | null;

export type RequiredChildren =
  | NonNullable<ReactNode>
  | NonNullable<ReactNode>[];

export type PropsWithCSS<TProps> = TProps & WithConditionalCSSProp<TProps>;

export type PropsWithRef<TProps, TElement> = PropsWithoutRef<TProps> &
  RefAttributes<TElement>;

export type PropsWithoutChildren<TProps> = Omit<TProps, 'children'>;
