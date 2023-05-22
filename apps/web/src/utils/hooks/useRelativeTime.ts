import dayjs from 'dayjs';

/**
 * Hook that returns a relative time string.
 */
export function useRelativeTime(time: Date) {
  //  received `Hydration` errors in dev-mode, may this also be a production issue?
  return dayjs(time).fromNow();
}
