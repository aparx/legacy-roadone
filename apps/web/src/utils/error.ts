import { MessagePath } from '@/utils/message';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

export type GlobalErrorMessage = {
  summary?: string | undefined;
  translate?: MessagePath;
};

export type GlobalError = {
  code: TRPC_ERROR_CODE_KEY;
  message?: GlobalErrorMessage;
  cause?: any;
};

type ErrorLike = Pick<TRPCError, 'code' | 'message' | 'cause'>;

export const globalErrorPrefix = 'global::';

export function createErrorFromGlobal(globalError: GlobalError): TRPCError {
  const { code, message, cause } = globalError;
  return new TRPCError({
    code,
    cause,
    message: message ? globalErrorPrefix + JSON.stringify(message) : undefined,
  });
}

export function parseGlobalFromClientError(
  clientError: TRPCClientError<any>
): GlobalError {
  return parseGlobalFromError({
    code: clientError.data.code,
    cause: clientError.cause,
    message: clientError.message,
  });
}

export function parseGlobalFromError(data: ErrorLike): GlobalError {
  const { message, cause, code } = data;
  let errorMessage: Partial<GlobalErrorMessage> = { summary: message };
  const o = message.startsWith(globalErrorPrefix)
    ? JSON.parse(message.substring(globalErrorPrefix.length))
    : null;
  if (o && 'summary' in o) errorMessage.summary = String(o.summary);
  if (o && 'translate' in o && typeof o.translate === 'string')
    errorMessage.translate = o.translate;
  return { code, cause, message: errorMessage };
}
