import type { BlogPostProcessedData } from '@/modules/blogs/blogPost';
import {
  blogPostContentSchema,
  blogPostEditSchema,
  blogPostProcessedSchema,
} from '@/modules/blogs/blogPost';
import {
  createPermissiveMiddleware,
  fullSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { blogReplyRouter } from '@/server/routers/blog/replies';
import { procedure, router } from '@/server/trpc';
import { renderMarkdown } from '@/utils/functional/markdown';
import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { infiniteQueryInput } from '@/utils/schemas/infiniteQueryInput';
import { pipePathRevalidate } from '@/utils/server/pipePathRevalidate';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const revalidatePath = '/blog';

/** `getBlogs` output schema */
const getBlogsOutputSchema = z.object({
  data: z.array(blogPostProcessedSchema),
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
  reply: blogReplyRouter,
  getBlogs: procedure
    .input(infiniteQueryInput)
    .output(getBlogsOutputSchema)
    .query(async ({ input }): Promise<GetBlogsOutput> => {
      const { cursor, limit } = input;
      const data = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip: cursor,
        take: limit + 1,
        include: { author: true },
      });
      const blogArray = await Promise.all(
        data.map(async (blog): Promise<BlogPostProcessedData> => {
          let markdown = await renderMarkdown(blog.content);
          (blog as BlogPostProcessedData).htmlContent = markdown;
          return blog;
        })
      );
      let nextCursor;
      if (blogArray.length > limit) {
        blogArray.pop();
        nextCursor = cursor + limit;
      }
      return { data: blogArray, nextCursor };
    }),
  addBlog: procedure
    .input(blogPostContentSchema)
    .use(createPermissiveMiddleware('blog.post'))
    .use(fullSanitizationMiddleware)
    .mutation(({ input, ctx: { session, res } }) => {
      return prisma.blogPost
        .create({ data: { ...input, authorId: session!.user!.id } })
        .then((data) => pipePathRevalidate(revalidatePath, res, data));
    }),
  editBlog: procedure
    .input(blogPostEditSchema)
    .use(createPermissiveMiddleware('blog.edit'))
    .use(fullSanitizationMiddleware)
    .mutation(({ input, ctx: { res } }) => {
      const { id } = input;
      return ensureBlogExistence(id)
        .then(() => prisma.blogPost.update({ data: input, where: { id } }))
        .then((data) => pipePathRevalidate(revalidatePath, res, data));
    }),
  deleteBlog: procedure
    .input(cuidSchema)
    .use(createPermissiveMiddleware('blog.delete'))
    .mutation(({ input: { id }, ctx: { res } }) => {
      return ensureBlogExistence(id)
        .then(() => prisma.blogPost.delete({ where: { id } }))
        .then((data) => pipePathRevalidate(revalidatePath, res, data));
    }),
});
