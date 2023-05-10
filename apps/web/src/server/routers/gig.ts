import { inputGigSchema } from '@/modules/schemas/gig';
import { createPermissiveProcedure } from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { z } from 'zod';

export const gigRouter = router({
  getGigs: procedure
    .input(
      z.object({
        cursor: z.number().int().default(0),
        limit: z.number().max(50).default(25),
      })
    )
    .query(async ({ input: { cursor: skip, limit: take } }) => {
      const data = await prisma.gig
        .findMany({ orderBy: { start: 'desc' }, skip, take: 1 + take })
        .then((data) => data ?? [])
        .catch(handleAsTRPCError);
      let nextCursor;
      if (data.length > take) {
        data.pop();
        nextCursor = skip + take;
      }
      return { data, nextCursor };
    }),
  addGig: procedure
    .use(createPermissiveProcedure('postEvents'))
    .input(inputGigSchema)
    .mutation(({ input }) => {
      console.log('successfully mutated!', input);
    }),
});
