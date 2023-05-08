import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { z } from 'zod';

export const gigRouter = router({
  getGigs: procedure
    .input(
      z.object({
        cursor: z.number().int().default(0),
        limit: z.number().max(100).default(50),
      })
    )
    .query(async ({ input: { cursor: skip, limit: take } }) => {
      const gigData = await prisma.gig
        .findMany({ orderBy: { start: 'desc' }, skip, take: 1 + take })
        .catch(handleAsTRPCError);
      let nextCursor;
      if (gigData.length > take) {
        gigData.pop();
        nextCursor = take;
      }
      return { data: gigData, nextCursor };
    }),
});
