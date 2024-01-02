import { formatString } from '@/utils/format';
import { getGlobalMessage } from '@/utils/message';
import { useMemo } from 'react';

export function useMessage(
  key: Parameters<typeof getGlobalMessage>[0],
  ...args: string[]
) {
  return useMemo(() => {
    const global = getGlobalMessage(key);
    if (!args.length) return global;
    return formatString(global, ...args);
  }, [key, args]);
}