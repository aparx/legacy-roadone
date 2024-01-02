import { EffectCallback, useEffect, useRef } from 'react';

export function useInitialEffect(
  callback: EffectCallback,
  ensureOnce: boolean = true
) {
  const onceRef = useRef(ensureOnce);
  const callbackRef = useRef(callback);
  const executed = useRef(false);
  useEffect(() => {
    callbackRef.current = callback;
    onceRef.current = ensureOnce;
  });
  useEffect(() => {
    if (!executed.current || !onceRef.current) callbackRef.current();
    executed.current = true;
  }, []);
}