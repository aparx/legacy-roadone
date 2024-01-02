import { createPermissiveMiddleware } from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { BlogPostProcedureData } from '@/server/routers/blog/index';
import { procedure } from '@/server/trpc';
import { $cuidField } from '@/utils/schemas/shared';
import { pipePathRevalidate } from '@/utils/server/pipePathRevalidate';


/** Creates a new procedure that allows for blog post mutation (delete). */
export const createDeleteBlogProcedure = ({
  revalidatePath,
}: BlogPostProcedureData) =>
  procedure
    .use(createPermissiveMiddleware('blog.delete'))
    .input($cuidField)
    .mutation(async ({ input, ctx: { res } }) => {
      return prisma.blogPost
        .delete({ where: { id: input.id } })
        .then(pipePathRevalidate(revalidatePath, res));
    });