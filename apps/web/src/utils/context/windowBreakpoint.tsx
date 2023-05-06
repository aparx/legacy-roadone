import {
  BreakpointState,
  useBreakpointEvent,
} from '@/utils/hooks/useBreakpointEvent';
import { createContext, ReactNode, useContext, useState } from 'react';

export const windowBreakpointContext = createContext<
  BreakpointState | undefined
>(undefined);

export function WindowBreakpointProvider(props: { children: ReactNode }) {
  const [state, setState] = useState<BreakpointState>();
  useBreakpointEvent(setState);
  return (
    <windowBreakpointContext.Provider value={state}>
      {props.children}
    </windowBreakpointContext.Provider>
  );
}

export function useWindowBreakpoint() {
  return useContext(windowBreakpointContext);
}
