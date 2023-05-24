import type { BlogPostProcessedData } from '@/modules/blogs/blogPost';
import {
  blogPostContentSchema,
  blogPostEditSchema,
  blogPostProcessedSchema,
} from '@/modules/blogs/blogPost';
import {
  createPermissiveMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import {
  blogReplyRouter,
  createDeepDepthSelectTree,
  deleteReplyNode,
} from '@/server/routers/blog/replies';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
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

export const blogRouter = router({
  reply: blogReplyRouter,

  /**
   * Endpoint that returns all blogs depending on the given pagination.
   */
  getBlogs: procedure
    .input(infiniteQueryInput)
    .output(getBlogsOutputSchema)
    .query(async ({ input }): Promise<GetBlogsOutput> => {
      const { cursor, limit } = input;
      const queryResult = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip: cursor,
        take: limit + 1,
        include: { author: true },
      });
      // prettier-ignore
      const blogArray: BlogPostProcessedData[] = await Promise.allSettled(
        queryResult.map(async (blog): Promise<BlogPostProcessedData> => {
          return renderMarkdown(blog.content)
            .then((md) => ((blog as BlogPostProcessedData).htmlContent = md))
            .then(() => blog);
        })
      ).then((a) => a.filter((a) => a.status === 'fulfilled'))
       .then((a) => a.map((b: any) => b.value));
      let nextCursor;
      if (blogArray.length > limit) {
        blogArray.pop();
        nextCursor = cursor + limit;
      }
      return { data: blogArray, nextCursor };
    }),

  /**
   * Endpoint mutation that adds given blog if authorized.
   * This endpoint sanitizes given input before being put in the database.
   * Required permission: `blog.post`
   */
  addBlog: procedure
    .input(blogPostContentSchema)
    .use(createPermissiveMiddleware('blog.post'))
    .use(shallowSanitizationMiddleware)
    .mutation(({ input, ctx: { session, res } }) => {
      return prisma.blogPost
        .create({ data: { ...input, authorId: session!.user!.id } })
        .then((data) => pipePathRevalidate(revalidatePath, res, data));
    }),

  /**
   * Endpoint mutation that edits given blog (with required `id`) if authorized.
   * This endpoint sanitizes given input before being put in the database.
   * Required permission: `blog.edit`
   */
  editBlog: procedure
    .input(blogPostEditSchema)
    .use(createPermissiveMiddleware('blog.edit'))
    .use(shallowSanitizationMiddleware)
    .mutation(({ input, ctx: { res } }) => {
      const { id } = input;
      return prisma.blogPost
        .update({ data: input, where: { id } })
        .then((data) => pipePathRevalidate(revalidatePath, res, data))
        .catch((e) => handleAsTRPCError(e, 'NOT_FOUND'));
    }),

  /**
   * Endpoint mutation that deletes a blog with given `id` if authorized.
   * Required permission: `blog.delete`
   */
  deleteBlog: procedure
    .input(cuidSchema)
    .use(createPermissiveMiddleware('blog.delete'))
    .mutation(async ({ input: { id }, ctx: { res } }) => {
      const node = await prisma.blogPost.findUnique({
        where: { id },
        select: {
          id: true,
          replies: createDeepDepthSelectTree('replies', { id: true }),
        },
      });
      if (!node) throw new TRPCError({ code: 'NOT_FOUND' });
      return deleteReplyNode({ node, type: 'blog' }).then((data) =>
        pipePathRevalidate(revalidatePath, res, data)
      );
    }),
});
