import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { resolveSource, ValueSource } from 'shared-utils';

export type ForeignErrorCodeMapper = ValueSource<
  TRPC_ERROR_CODE_KEY | undefined | null,
  [string]
>;

export function createTRPCError(
  error: any,
  codeMapper?: ForeignErrorCodeMapper
): TRPCError {
  if (error instanceof TRPCError) return error;
  if (error instanceof Prisma.PrismaClientKnownRequestError)
    return new TRPCError({
      code: resolveSource(codeMapper, error.code) ?? 'INTERNAL_SERVER_ERROR',
      cause: error.cause,
      message: `${error.code}: ${error.message}`,
    });
  if (error instanceof Prisma.PrismaClientUnknownRequestError)
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      cause: error.cause,
      message: error.message,
    });
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
  });
}

/** @throws TRPCError */
export function handleAsTRPCError(
  error: any,
  codeMapper?: ForeignErrorCodeMapper
): never {
  throw createTRPCError(error, codeMapper);
}
