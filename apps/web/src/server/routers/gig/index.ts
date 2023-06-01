import { $gigContent, $gigEdit, ProcessedGigModel } from '@/modules/gigs/gig';
import {
  createPermissiveMiddleware,
  rateLimitingMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { createErrorFromGlobal } from '@/utils/error';
import { renderMarkdown } from '@/utils/functional/markdown';
import {
  createInfiniteQueryResult,
  GetInfiniteQueryResult,
  infiniteQueryInput,
} from '@/utils/schemas/infiniteQuery';
import { $cuidField } from '@/utils/schemas/shared';
import { pipePathRevalidate } from '@/utils/server/pipePathRevalidate';

const revalidatePath = '/gigs';

export type GetGigsOutput = GetInfiniteQueryResult<ProcessedGigModel>;

async function isGigExisting(id: string): Promise<boolean> {
  return (await prisma.gig.count({ where: { id } })) !== 0;
}

/**
 * @throws TRPCError - if Gig with `id` is not existing if `complement` is true,
 * or if it is existing if `complement` is false.
 */
async function ensureGigExistence(id: string, complement: boolean = true) {
  if ((await isGigExisting(id)) !== complement)
    throw createErrorFromGlobal({
      code: 'NOT_FOUND',
      message: {
        summary: 'Gig not found',
        translate: 'responses.gig.not_found',
      },
    });
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
    .input(infiniteQueryInput)
    .query(async ({ input }): Promise<GetGigsOutput> => {
      // console.log('called getGigs endpoint', input);
      const data = await prisma.gig
        .findMany({
          orderBy: { start: 'desc' },
          skip: input.cursor,
          take: 1 + input.limit,
        })
        .then((data) => data ?? [])
        .catch(handleAsTRPCError);
      // Parsing markdown every request isn't the most efficient, but only takes a
      // couple milliseconds (usually 1-2) for 30 gigs. This is the most future-proof,
      // since storing HTML in the Database might become an obstacle over time, in case
      // tags or attributes need change.
      return createInfiniteQueryResult(input, {
        infiniteData: await Promise.all(
          data.map(async (gig): Promise<ProcessedGigModel> => {
            if (!gig.description?.length) return gig;
            const result = gig as ProcessedGigModel;
            await renderMarkdown(gig.description).then(
              (markdown) => (result.htmlDescription = markdown)
            );
            return result;
          })
        ),
      });
    }),

  /**
   * Endpoint mutation that adds a Gig from given input if authorized.
   * This endpoint sanitizes given input before being put in the database.
   * Required permission: `gig.post`
   */
  addGig: procedure
    .input($gigContent)
    .use(createPermissiveMiddleware('gig.post'))
    .use(rateLimitingMiddleware)
    .use(shallowSanitizationMiddleware)
    .mutation(async ({ input, ctx: { res } }) => {
      if (
        await prisma.gig.findUnique({
          where: { title_start: { title: input.title, start: input.start } },
        })
      ) {
        throw createErrorFromGlobal({
          code: 'CONFLICT',
          message: {
            summary: 'Title with given start already exists',
            translate: 'responses.gig.add_title_start_duplicate',
          },
        });
      }
      return await prisma.gig
        .create({ data: input })
        .then(pipePathRevalidate(revalidatePath, res))
        .catch(handleAsTRPCError);
    }),

  /**
   * Endpoint mutation that edits given Gig if authorized.
   * This endpoint sanitizes given input before being put in the database.
   * Required permission: `gig.edit`
   */
  editGig: procedure
    .input($gigEdit)
    .use(createPermissiveMiddleware('gig.edit'))
    .use(rateLimitingMiddleware)
    .use(shallowSanitizationMiddleware)
    .mutation(({ input, ctx: { res } }) => {
      const { id } = input;
      return ensureGigExistence(id).then(() =>
        prisma.gig
          .update({ where: { id }, data: input })
          .then(pipePathRevalidate(revalidatePath, res))
          .catch(handleAsTRPCError)
      );
    }),

  /**
   * Endpoint mutation that deletes a Gig with given `id` if authorized.
   * Required permission: `gig.delete`
   */
  deleteGig: procedure
    .input($cuidField)
    .use(createPermissiveMiddleware('gig.delete'))
    .mutation(({ input, ctx: { res } }) => {
      const { id } = input;
      return ensureGigExistence(id)
        .then(() => prisma.gig.delete({ where: { id } }))
        .then(pipePathRevalidate(revalidatePath, res))
        .catch(handleAsTRPCError);
    }),
});
