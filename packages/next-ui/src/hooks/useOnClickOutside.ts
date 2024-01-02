import { useOnIsomorphicEvent } from './useOnIsomorphicEvent';
import { RefObject, useEffect, useRef } from 'react';

type _EventTarget = RefObject<EventTarget> | undefined | null;

export function useOnClickOutside(
  listener: (event: MouseEvent) => any,
  target: _EventTarget,
  ...include: _EventTarget[]
) {
  const callback = useRef(listener);
  // prettier-ignore
  useEffect(() => { callback.current = listener });
  function onClick(event: MouseEvent) {
    if (!target?.current) return;
    if (target.current === event.target) return;
    if (!event.target || nodeContains(target.current, event.target)) return;
    const index = include?.findIndex?.((t: _EventTarget) =>
      nodeContains(t?.current ?? undefined, event.target ?? undefined)
    );
    if (index === -1 || index === undefined) callback.current(event);
  }
  useOnIsomorphicEvent('click', onClick, 'window', { capture: true });
}

function nodeContains(a: EventTarget | undefined, b: EventTarget | undefined) {
  return a === b || (isNode(a) && isNode(b) && a.contains(b));
}

function isNode(target: EventTarget | undefined | null): target is Node {
  return !!target && 'contains' in target;
}