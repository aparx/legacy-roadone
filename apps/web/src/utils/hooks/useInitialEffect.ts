import { EffectCallback, useEffect, useRef } from 'react';

export function useInitialEffect(
  callback: EffectCallback,
  ensureOnce: boolean = true
) {
  const callbackRef = useRef(callback);
  const executed = useRef(false);
  useEffect(() => {
    callbackRef.current = callback;
  });
  useEffect(() => {
    if (!executed.current || !ensureOnce) callbackRef.current();
    executed.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
