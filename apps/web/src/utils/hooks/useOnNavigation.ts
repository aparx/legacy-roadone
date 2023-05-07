import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export type PageChangeListener = (fromPath: string, toPath: string) => any;

/**
 * Hook that calls `listener` when the user navigates from page to page.
 *
 * @param listener the listener being called, when the page changes
 */
export function useOnNavigation(listener: PageChangeListener) {
  const path = usePathname();
  const lastPath = useRef<string>();
  const callback = useRef<PageChangeListener>(listener);
  // prettier-ignore
  useEffect(() => { callback.current = listener });
  useEffect(() => {
    if (lastPath.current && lastPath.current !== path)
      callback.current?.(lastPath.current, path);
    lastPath.current = path;
  }, [listener, path]);
}
