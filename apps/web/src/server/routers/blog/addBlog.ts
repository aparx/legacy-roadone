import { $blogPostContent, $blogPostProcessed } from '@/modules/blog/blog';
import {
  createPermissiveMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { BlogPostProcedureData } from '@/server/routers/blog/index';
import { procedure } from '@/server/trpc';
import { pipePathRevalidate } from '@/utils/server/pipePathRevalidate';
import { TRPCError } from '@trpc/server';

/** Creates a new procedure that allows for blog post mutation (add). */
export const createAddBlogProcedure = ({
  revalidatePath,
  processInclude,
  processQuery,
}: BlogPostProcedureData) =>
  procedure
    .use(createPermissiveMiddleware('blog.post'))
    .use(shallowSanitizationMiddleware)
    .input($blogPostContent)
    .output($blogPostProcessed)
    .mutation(async ({ input, ctx: { session, res } }) => {
      if (!session?.user.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return processQuery(
        await prisma.blogPost
          .create({
            data: { ...input, authorId: session.user.id },
            include: processInclude,
          })
          .then(pipePathRevalidate(revalidatePath, res))
      );
    });
