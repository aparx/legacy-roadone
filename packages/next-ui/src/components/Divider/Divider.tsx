/** @jsxImportSource @emotion/react */
import { PropsWithStyleable, useStyleableMerge } from '../../utils';
import * as style from './Divider.style';
import { useTheme } from '@emotion/react';

export type DividerData = {
  /** @default 100% */
  length?: number | `${number}%`;
  /** @default 2 (in px) */
  thickness?: number;
  /** @default 'horizontal' '*/
  orientation?: 'horizontal' | 'vertical';
};

export type DividerProps = PropsWithStyleable<DividerData>;

export default function Divider({
  length,
  orientation,
  thickness,
  ...restProps
}: DividerProps) {
  return (
    <div
      css={style.divider(useTheme(), { length, orientation, thickness })}
      {...useStyleableMerge(restProps)}
    />
  );
}
