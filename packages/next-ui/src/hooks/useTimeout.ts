import { useEffect, useRef } from 'react';

export function useAwareTimeout(callback: () => any, delay: number | null = 5) {
  const _ref = useRef(callback);
  const delayRef = useRef(delay);
  // prettier-ignore
  useEffect(() => { _ref.current = callback; });
  useEffect(() => {
    if (!delay && delay !== 0) return;
    if (typeof window === 'undefined') return;
    const startTime = Date.now();
    const id = window.setTimeout(() => _ref.current(), delayRef.current!);
    return () => {
      window.clearTimeout(id);
      delayRef.current! -= Date.now() - startTime /* time elapsed */;
    };
  });
}

export function useSimpleTimeout(
  callback: () => any,
  delay: number | null = 5
) {
  const callbackRef = useRef(callback);
  // prettier-ignore
  useEffect(() => { callbackRef.current = callback; });
  useEffect(() => {
    if (!delay && delay !== 0) return;
    if (typeof window === 'undefined') return;
    const id = window.setTimeout(() => callbackRef.current(), delay);
    return () => {
      window.clearTimeout(id);
    };
  });
}
