import dayjs from 'dayjs';
import { useEffect, useState } from 'react';


/**
 * Hook that returns a relative time string.
 */
export function useRelativeTime(time: Date) {
  // TODO received `Hydration` errors in dev-mode, may this also be a production issue?
  const [state, setState] = useState(dayjs(time).fromNow());
  const unix = time.getTime();
  useEffect(() => setState(dayjs(unix).fromNow()), [unix]);
  return state;
}