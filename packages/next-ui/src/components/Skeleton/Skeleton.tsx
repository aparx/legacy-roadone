/** @jsxImportSource @emotion/react */
import {
  MultiplierValueInput,
  propMerge,
  PropsWithoutChildren,
  StyleableProp,
  useStyleableMerge,
} from '../../utils';
import { SkeletonConfig as config } from './Skeleton.config';
import * as style from './Skeleton.style';
import { Theme, useTheme } from '@emotion/react';
import { CSSProperties, forwardRef, HTMLAttributes } from 'react';
import { ObjectConjunction, resolveSource, ValueSource } from 'shared-utils';

export type InternalSkeletonProps = {
  /** @default 100% */
  width?: number | string;
  /** @default 50 (px) */
  height?: number | string;
  /** @default 'transparent' */
  baseColor?: ValueSource<string, [Theme]>;
  /** @default (theme) sys.color.scheme.primary */
  scanColor?: ValueSource<string, [Theme]>;
  /** @default UI.generalRoundness */
  roundness?: MultiplierValueInput<'roundness'>;
};

export type SkeletonProps = ObjectConjunction<
  PropsWithoutChildren<HTMLAttributes<HTMLDivElement>>,
  InternalSkeletonProps & StyleableProp
>;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function SkeletonRenderer(
    {
      width = config.defaults.width,
      height = config.defaults.height,
      roundness = config.defaults.roundness,
      baseColor = config.defaults.baseColor,
      scanColor = config.defaults.scanColor,
      ...rest
    },
    ref
  ) {
    const theme = useTheme();
    return (
      <div
        ref={ref}
        {...propMerge(
          {
            css: style.skeleton(
              theme,
              resolveSource(baseColor, theme),
              resolveSource(scanColor, theme)
            ),
          },
          {
            style: {
              width,
              height,
              borderRadius: theme.rt.multipliers.roundness(roundness),
            } satisfies CSSProperties,
          },
          useStyleableMerge(rest)
        )}
      />
    );
  }
);

export default Skeleton;
