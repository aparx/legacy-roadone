import { useEffect, useRef } from 'react';

export function useTimeout(callback: () => any, delay: number | null = 5) {
  const callbackRef = useRef(callback);
  // prettier-ignore
  useEffect(() => { callbackRef.current = callback; });
  useEffect(() => {
    if (!delay && delay !== 0) return;
    if (typeof window === 'undefined') return;
    const id = window.setTimeout(() => callbackRef.current(), delay);
    return () => window.clearTimeout(id);
  });
}
