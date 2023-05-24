import {
  gigContentSchema,
  GigData,
  gigEditSchema,
  GigProcessedData,
} from '@/modules/gigs/gig';
import {
  createPermissiveMiddleware,
  rateLimitingMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { renderMarkdown } from '@/utils/functional/markdown';
import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { infiniteQueryInput } from '@/utils/schemas/infiniteQueryInput';
import { pipePathRevalidate } from '@/utils/server/pipePathRevalidate';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const revalidatePath = '/gigs';

export type GetGigsOutput = {
  data: GigData[];
  nextCursor: number | undefined | null;
};

async function isGigExisting(id: string): Promise<boolean> {
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
  /**
   * Endpoint query that returns all available Gigs within given pagination, all ordered
   * after the `start` field date in descending order.
   */
  getGigs: procedure
    .input(
      z
        .object({ parseMarkdown: z.boolean().default(false) })
        .extend(infiniteQueryInput.shape)
    )
    .query(async ({ input }): Promise<GetGigsOutput> => {
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
            data.map(async (gig): Promise<GigProcessedData> => {
              if (!gig.description?.length) return gig;
              const markdown = await renderMarkdown(gig.description!);
              (gig as GigProcessedData).htmlDescription = markdown;
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

  /**
   * Endpoint mutation that adds a Gig from given input if authorized.
   * This endpoint sanitizes given input before being put in the database.
   * Required permission: `gig.post`
   */
  addGig: procedure
    .input(gigContentSchema)
    .use(createPermissiveMiddleware('gig.post'))
    .use(rateLimitingMiddleware)
    .use(shallowSanitizationMiddleware)
    .mutation(async ({ input, ctx: { res } }) => {
      if (
        await prisma.gig.findUnique({
          where: { title_start: { title: input.title, start: input.start } },
        })
      ) {
        throw new TRPCError({
          code: 'CONFLICT',
          // TODO replace by global message key
          message: 'Title with given start already exists',
        });
      }
      return await prisma.gig
        .create({ data: input })
        .then((data) => pipePathRevalidate(revalidatePath, res, data))
        .catch(handleAsTRPCError);
    }),

  /**
   * Endpoint mutation that edits given Gig if authorized.
   * This endpoint sanitizes given input before being put in the database.
   * Required permission: `gig.edit`
   */
  editGig: procedure
    .input(gigEditSchema)
    .use(createPermissiveMiddleware('gig.edit'))
    .use(rateLimitingMiddleware)
    .use(shallowSanitizationMiddleware)
    .mutation(({ input, ctx: { res } }) => {
      const { id } = input;
      return ensureGigExistence(id).then(() =>
        prisma.gig
          .update({ where: { id }, data: input })
          .then((data) => pipePathRevalidate(revalidatePath, res, data))
          .catch(handleAsTRPCError)
      );
    }),

  /**
   * Endpoint mutation that deletes a Gig with given `id` if authorized.
   * Required permission: `gig.delete`
   */
  deleteGig: procedure
    .input(cuidSchema)
    .use(createPermissiveMiddleware('gig.delete'))
    .mutation(({ input, ctx: { res } }) => {
      const { id } = input;
      return ensureGigExistence(id)
        .then(() => prisma.gig.delete({ where: { id } }))
        .then((data) => pipePathRevalidate(revalidatePath, res, data))
        .catch(handleAsTRPCError);
    }),
});
