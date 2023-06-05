import { ToastData } from '@/components/Toast/Toast';
import { useToastHandle } from '@/handles';
import { GlobalError, parseGlobalFromClientError } from '@/utils/error';
import { getGlobalMessage } from '@/utils/message';
import { TRPCClientError } from '@trpc/client';
import { useCallback } from 'react';
import { Optional } from 'utility-types';

export function useAddErrorToast() {
  const addToast = useToastHandle((s) => s.add);
  return useCallback(
    (
      error: any,
      toast: Optional<Omit<ToastData, 'type' | 'message'>, 'id'> = {}
    ) => {
      let o: GlobalError = { code: 'BAD_REQUEST' };
      if (error instanceof TRPCClientError) {
        o = parseGlobalFromClientError(error);
      } else if (typeof error === 'object' && 'message' in error)
        o.message = { summary: String(error.message) };
      let message = o.message?.translate
        ? getGlobalMessage(o.message?.translate, o.message?.summary)
        : o.message?.summary;
      addToast({
        type: 'error',
        duration: message ? Math.max(2 + message.length / 30, 3) : undefined,
        title: getGlobalMessage('general.actionFailed'),
        message,
        ...toast,
      });
    },
    [addToast]
  );
}
