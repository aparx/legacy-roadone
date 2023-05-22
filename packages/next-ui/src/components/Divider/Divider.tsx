/** @jsxImportSource @emotion/react */
import { propMerge, PropsWithStyleable } from '../../utils';
import { DividerConfig as config } from './Divider.config';
import * as style from './Divider.style';
import { useTheme } from '@emotion/react';
import { HTMLAttributes } from 'react';
import type { ObjectConjunction } from 'shared-utils';
import { OpacityEmphasis } from 'theme-core';

export type DividerData = {
  /** @default 2 (in pixels) */
  thickness: number;
  /** @default 100% */
  length: number | string;
  /** @default 'high' */
  emphasis: OpacityEmphasis;
  /** @default 'horizontal' */
  orientation: 'horizontal' | 'vertical';
};

export type InternalDividerProps = Partial<DividerData>;

export type DividerProps = PropsWithStyleable<
  ObjectConjunction<HTMLAttributes<HTMLDivElement>, InternalDividerProps>
>;

export default function Divider({
  length = config.defaults.length,
  thickness = config.defaults.thickness,
  orientation = config.defaults.orientation,
  emphasis = config.defaults.emphasis,
  ...rest
}: DividerProps) {
  return (
    <div
      {...propMerge(
        {
          css: style.divider(useTheme(), {
            length,
            thickness,
            orientation,
            emphasis,
          }),
        },
        rest
      )}
    ></div>
  );
}
