/** @jsxImportSource @emotion/react */
import { useScrimRoot } from '../../context';
import { Portal } from '../Portal';
import * as style from './Scrim.style';
import { forwardRef, HTMLAttributes, useEffect } from 'react';

export type InternalScrimProps = {
  children?: undefined;
  hidden?: boolean;
};

export type ScrimProps = InternalScrimProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof InternalScrimProps>;

const rootAttribMap = {
  'aria-hidden': true,
  /** Ensures the app root cannot be focused anymore. */
  inert: true,
} as const;

const rootAttribKeys = Object.keys(rootAttribMap);

// @ts-ignore
export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(
  function ScrimRenderer({ hidden, ...restProps }: ScrimProps, ref) {
    const root = useScrimRoot()?.current;
    useEffect(() => {
      if (!root) return;
      rootAttribKeys.forEach((k) => root.setAttribute(k, rootAttribMap[k]));
      return () => rootAttribKeys.forEach((a) => root.removeAttribute(a));
    });
    return hidden ? null : (
      <Portal>
        <div css={style.scrim} {...restProps} ref={ref} />
      </Portal>
    );
  }
);

export default Scrim;