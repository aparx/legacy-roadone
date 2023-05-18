import {
  editGigSchema,
  GigEvent,
  gigIdSchema,
  inputGigSchema,
  ProcessedGig,
} from '@/modules/schemas/gig';
import { createPermissiveProcedure } from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { renderMarkdown } from '@/utils/functional/markdown';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export type GetGigsResult = {
  data: GigEvent[];
  nextCursor: number | undefined | null;
};

export async function isGigExisting(id: string): Promise<boolean> {
  return (await prisma.gig.count({ where: { id } })) !== 0;
}

/**
 * @throws TRPCError - if Gig with `id` is not existing if `complement` is true,
 * or if it is existing if `complement` is false.
 */
async function ensureGigExistence(id: string, complement: boolean = true) {
  if ((await isGigExisting(id)) !== complement)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Gig not found' });
}

/**
 * Gig router, handling `Gigs` (events).
 * Note: editing, deleting and adding Gigs will result in an immediate
 * revalidation of the `/gigs` route.
 */
export const gigRouter = router({
  getGigs: procedure
    .input(
      z.object({
        cursor: z.number().int().default(0),
        limit: z.number().max(50).default(30),
        parseMarkdown: z.boolean().default(false),
      })
    )
    .query(async ({ input }): Promise<GetGigsResult> => {
      // console.log('called getGigs endpoint', input);
      const { cursor: skip, limit: take, parseMarkdown } = input;
      const data = await prisma.gig
        .findMany({ orderBy: { start: 'desc' }, skip, take: 1 + take })
        .then((data) => data ?? [])
        .catch(handleAsTRPCError);
      // Parsing markdown every request isn't the most efficient, but only takes a
      // couple milliseconds (usually 1-2) for 30 gigs. This is the most future-proof,
      // since storing HTML in the Database might become an obstacle over time, in case
      // tags or attributes need change.
      const gigArray = parseMarkdown
        ? await Promise.all(
            data.map(async (gig): Promise<ProcessedGig> => {
              if (!gig.description?.length) return gig;
              const markdown = await renderMarkdown(gig.description!, true);
              (gig as ProcessedGig).htmlDescription = markdown;
              return gig;
            })
          )
        : data;
      let nextCursor;
      if (gigArray.length > take) {
        gigArray.pop();
        nextCursor = skip + take;
      }
      return { data: gigArray, nextCursor };
    }),
  addGig: procedure
    .use(createPermissiveProcedure('postEvents'))
    .input(inputGigSchema)
    .mutation(async ({ input, ctx: { res } }) => {
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
      return await prisma.gig
        .create({ data: input })
        .then((data) => {
          res?.revalidate('/gigs');
          return data;
        })
        .catch(handleAsTRPCError);
    }),
  deleteGig: procedure
    .use(createPermissiveProcedure('deleteEvents'))
    .input(gigIdSchema)
    .mutation(async ({ input, ctx: { res } }) => {
      const { id } = input;
      return ensureGigExistence(id)
        .then(() => prisma.gig.delete({ where: { id } }))
        .then((data) => {
          res?.revalidate('/gigs');
          return data;
        })
        .catch(handleAsTRPCError);
    }),
  editGig: procedure
    .use(createPermissiveProcedure('editEvents'))
    .input(editGigSchema)
    .mutation(async ({ input, ctx: { res } }) => {
      const { id } = input;
      return ensureGigExistence(id).then(() =>
        prisma.gig
          .update({ where: { id }, data: input })
          .then((data) => {
            res?.revalidate('/gigs');
            return data;
          })
          .catch(handleAsTRPCError)
      );
    }),
});
