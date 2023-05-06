import { useEffect, useRef } from 'react';

export type UseEventListener<TType extends keyof GlobalEventHandlersEventMap> =
  (ev: GlobalEventHandlersEventMap[TType]) => any;

export function useEvent<
  TType extends keyof GlobalEventHandlersEventMap,
  TTarget extends EventTarget
>(
  type: TType,
  listener: UseEventListener<TType>,
  target: TTarget | undefined | null,
  opts?: AddEventListenerOptions | boolean
) {
  const callbackRef = useRef<UseEventListener<TType>>(listener);
  useEffect(() => {
    callbackRef.current = listener;
  });
  useEffect(() => {
    if (!target || !callbackRef.current) return;
    const handler = (ev: any) => callbackRef.current(ev);
    target.addEventListener(type, handler, opts);
    return () => target.removeEventListener(type, handler);
  }, [opts, target, type]);
}
