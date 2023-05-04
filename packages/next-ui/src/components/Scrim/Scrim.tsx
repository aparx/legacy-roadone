/** @jsxImportSource @emotion/react */
import { Portal } from '../Portal';
import * as style from './Scrim.style';
import { forwardRef, HTMLAttributes } from 'react';

export type InternalScrimProps = {
  children?: undefined;
  hidden?: boolean;
};

export type ScrimProps = InternalScrimProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof InternalScrimProps>;

export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(
  function ScrimRenderer({ hidden, ...restProps }: ScrimProps, ref) {
    return (
      !hidden && (
        <Portal>
          <div css={style.scrim} {...restProps} ref={ref} />
        </Portal>
      )
    );
  }
);

export default Scrim;
