import {
  createContext,
  PropsWithChildren,
  RefObject,
  useContext,
  useId,
  useRef,
} from 'react';

export const scrimRootContext =
  createContext<RefObject<HTMLDivElement | null>>(null);

export const ScrimRootProvider = scrimRootContext.Provider;

export function useScrimRoot() {
  return useContext(scrimRootContext);
}

/** Children of this component will be non-interactive when `Scrim` is visible */
export function ScrimRoot({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();
  return (
    <ScrimRootProvider value={ref}>
      <div ref={ref} id={`scrim-root-${uid}`}>
        {children}
      </div>
    </ScrimRootProvider>
  );
}
