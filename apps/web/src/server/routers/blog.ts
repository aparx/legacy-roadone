import type { BlogProcessedData } from '@/modules/schemas/blog';
import {
  blogContentSchema,
  blogEditSchema,
  blogIdSchema,
  blogProcessedSchema,
} from '@/modules/schemas/blog';
import {
  createPermissiveProcedure,
  fullSanitizationProcedure,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { renderMarkdown } from '@/utils/functional/markdown';
import { infiniteQueryInput } from '@/utils/schemas/infiniteQueryInput';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

/** `getBlogs` output schema */
const getBlogsOutputSchema = z.object({
  data: z.array(blogProcessedSchema),
  nextCursor: z.number().nullish(),
});

export type GetBlogsOutput = z.infer<typeof getBlogsOutputSchema>;

async function isBlogExisting(id: string): Promise<boolean> {
  return (await prisma.blogPost.count({ where: { id } })) !== 0;
}

/**
 * @throws TRPCError - if Blog with `id` is not existing if `complement` is true,
 * or if it is existing if `complement` is false.
 */
async function ensureBlogExistence(id: string, complement: boolean = true) {
  if ((await isBlogExisting(id)) !== complement)
    throw new TRPCError({ code: 'NOT_FOUND', message: `Blog ${id} not found` });
}

export const blogRouter = router({
  getBlogs: procedure
    .input(infiniteQueryInput)
    .output(getBlogsOutputSchema)
    .query(async ({ input }): Promise<GetBlogsOutput> => {
      const { cursor, limit } = input;
      const data = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip: cursor,
        take: limit,
        include: { author: true },
      });
      console.time('markdown');
      const blogArray = await Promise.all(
        data.map(async (blog): Promise<BlogProcessedData> => {
          let markdown = await renderMarkdown(blog.content);
          (blog as BlogProcessedData).htmlContent = markdown;
          return blog;
        })
      );
      console.timeEnd('markdown');
      let nextCursor;
      if (blogArray.length > limit) {
        blogArray.pop();
        nextCursor = cursor + limit;
      }
      return { data: blogArray, nextCursor };
    }),
  addBlog: procedure
    .input(blogContentSchema)
    .use(createPermissiveProcedure('blog.post'))
    .use(fullSanitizationProcedure)
    .mutation(async ({ input, ctx: { session } }) => {
      return prisma.blogPost.create({
        data: { ...input, authorId: session!.user!.id },
      });
    }),
  editBlog: procedure
    .input(blogEditSchema)
    .use(createPermissiveProcedure('blog.edit'))
    .use(fullSanitizationProcedure)
    .mutation(async ({ input }) => {
      const { id } = input;
      return ensureBlogExistence(id).then(() =>
        prisma.blogPost.update({ data: input, where: { id } })
      );
    }),
  deleteBlog: procedure
    .input(blogIdSchema)
    .use(createPermissiveProcedure('blog.delete'))
    .mutation(async ({ input: { id } }) => {
      return ensureBlogExistence(id).then(() =>
        prisma.blogPost.delete({ where: { id } })
      );
    }),
});
