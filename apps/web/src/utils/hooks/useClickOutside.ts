import { useIsomorphicEvent } from 'next-ui';
import { useEffect, useRef } from 'react';

export function useClickOutside(
  listener: (event: MouseEvent) => any,
  target: EventTarget | undefined | null,
  ...include: (EventTarget | undefined | null)[]
) {
  const callback = useRef(listener);
  // prettier-ignore
  useEffect(() => { callback.current = listener });
  function onClick(event: MouseEvent) {
    if (!target) return;
    if (target === event.target) return;
    if (!event.target || (target as any)?.contains?.(event.target)) return;
    // prettier-ignore
    if (include?.findIndex?.((e: any) => {
      return e === event.target || e?.contains?.(event.target)
    }) === -1) callback.current(event);
  }
  useIsomorphicEvent('click', onClick, 'window', { capture: true });
}
