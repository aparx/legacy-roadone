import { PropsWithChildren } from 'react';

/** @jsxImportSource @emotion/react */
export type ShowIfProps = PropsWithChildren<{
  condition: any;
}>;

export default function ShowIf({ condition, children }: ShowIfProps) {
  return !!condition && children ? <>{children}</> : null;
}
