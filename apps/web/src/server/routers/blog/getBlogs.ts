import { $blogPostProcessed } from '@/modules/blog/blog';
import { prisma } from '@/server/prisma';
import { BlogPostProcedureData } from '@/server/routers/blog/index';
import { procedure } from '@/server/trpc';
import {
  createInfiniteQueryOutput,
  createInfiniteQueryResult,
  infiniteQueryInput,
} from '@/utils/schemas/infiniteQuery';

/** Creates a new procedure that queries blogs. */
export const createGetBlogsProcedure = ({
  processInclude,
  process,
}: BlogPostProcedureData) =>
  procedure
    .input(infiniteQueryInput)
    .output(createInfiniteQueryOutput($blogPostProcessed))
    .query(async ({ input }) => {
      const queryData = await prisma.blogPost.findMany({
        skip: input.cursor,
        take: 1 + input.limit,
        orderBy: { createdAt: 'desc' },
        include: processInclude,
      });
      return createInfiniteQueryResult(input, {
        infiniteData: await Promise.all(
          queryData.map(({ _count, ...post }) => process(post, _count))
        ),
      });
    });
