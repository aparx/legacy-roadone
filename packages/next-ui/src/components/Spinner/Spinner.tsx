/** @jsxImportSource @emotion/react */
import { propMerge, PropsWithStyleable, useStyleableMerge } from '../../utils';
import { SpinnerConfig as config } from './Spinner.config';
import * as style from './Spinner.style';
import { Theme, useTheme } from '@emotion/react';
import { HTMLAttributes } from 'react';
import { ObjectConjunction, ValueSource } from 'shared-utils';

export type SpinnerData = {
  size: number;
  color: ValueSource<string, [Theme]>;
  /** Speed multiplier, undefined being equal to 1 (one) */
  speed?: number;
};

export type InternalSpinnerProps = Partial<SpinnerData>;

export type SpinnerProps = ObjectConjunction<
  HTMLAttributes<HTMLDivElement>,
  PropsWithStyleable<InternalSpinnerProps>
>;

export default function Spinner({
  size = config.defaults.size,
  color = config.defaults.color,
  speed = config.defaults.speed,
  ...rest
}: SpinnerProps) {
  return (
    <div
      {...propMerge(
        { css: style.spinner(useTheme(), { size, color, speed }) },
        useStyleableMerge(rest)
      )}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
