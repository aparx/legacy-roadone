import { $blogPostEdit, $blogPostProcessed } from '@/modules/blog/blog';
import {
  createPermissiveMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { BlogPostProcedureData } from '@/server/routers/blog/index';
import { procedure } from '@/server/trpc';
import { pipePathRevalidate } from '@/utils/server/pipePathRevalidate';

/** Creates a new procedure that allows for blog post mutation (edit). */
export const createEditBlogProcedure = ({
  revalidatePath,
  processInclude,
  processQuery,
}: BlogPostProcedureData) =>
  procedure
    .use(createPermissiveMiddleware('blog.edit'))
    .use(shallowSanitizationMiddleware)
    .input($blogPostEdit)
    .output($blogPostProcessed)
    .mutation(async ({ input, ctx: { res } }) => {
      const { id, ...updatedData } = input;
      return processQuery(
        await prisma.blogPost
          .update({
            where: { id: input.id },
            data: updatedData,
            include: processInclude,
          })
          .then(pipePathRevalidate(revalidatePath, res))
      );
    });
