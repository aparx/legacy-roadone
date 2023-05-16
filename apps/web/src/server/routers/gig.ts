import {
  editGigSchema,
  gigIdSchema,
  inputGigSchema,
} from '@/modules/schemas/gig';
import { createPermissiveProcedure } from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const gigRouter = router({
  getGigs: procedure
    .input(
      z.object({
        cursor: z.number().int().default(0),
        limit: z.number().max(50).default(30),
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
    .mutation(async ({ input }) => {
      if (
        await prisma.gig.findUnique({
          where: { title_start: { title: input.title, start: input.start } },
        })
      ) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Title with given start already exists',
        });
      }
      return await prisma.gig.create({ data: input }).catch(handleAsTRPCError);
    }),
  editGig: procedure
    .use(createPermissiveProcedure('editEvents'))
    .input(editGigSchema)
    .mutation(async ({ input }) => {
      const { id } = input;
      if (!(await prisma.gig.findUnique({ where: { id } })))
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Gig not found' });
      return await prisma.gig
        .update({ where: { id }, data: input })
        .catch(handleAsTRPCError);
    }),
  deleteGig: procedure
    .use(createPermissiveProcedure('deleteEvents'))
    .input(gigIdSchema)
    .mutation(async ({ input }) => {
      const { id } = input;
      if (!(await prisma.gig.findUnique({ where: { id } })))
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Gig not found' });
      return prisma.gig.delete({ where: { id } });
    }),
});
