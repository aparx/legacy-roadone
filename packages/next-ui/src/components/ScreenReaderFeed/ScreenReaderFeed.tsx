/** @jsxImportSource @emotion/react */
import * as style from './ScreenReaderFeed.style';
import { PropsWithChildren } from 'react';

export type ScreenReaderOnlyProps = Required<PropsWithChildren>;

export default function ScreenReaderFeed({ children }: ScreenReaderOnlyProps) {
  return <div css={style.screenReaderFeed}>{children}</div>;
}
