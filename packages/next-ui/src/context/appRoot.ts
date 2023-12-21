import { createContext, RefObject, useContext } from 'react';

export const appRootContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

export const AppRootProvider = appRootContext.Provider;

export function useAppRoot() {
  return useContext(appRootContext);
}
