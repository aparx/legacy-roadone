/** @jsxImportSource @emotion/react */
import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const portalId = 'app-portals';

export type PortalProps = {
  children: ReactNode | ReactNode[];
  key?: string | null;
};

export default function Portal({ children, key }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<Element>(null);
  useEffect(() => {
    ref.current = document.getElementById(portalId);
    setMounted(true);
  }, []);
  return mounted && ref.current
    ? createPortal(children, ref.current, key)
    : null;
}
