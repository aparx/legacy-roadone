import { BlogPostModel, ProcessedBlogPostModel } from '@/modules/blog/blog';
import { createAddBlogProcedure } from '@/server/routers/blog/addBlog';
import { createDeleteBlogProcedure } from '@/server/routers/blog/deleteBlog';
import { createEditBlogProcedure } from '@/server/routers/blog/editBlog';
import { createGetBlogsProcedure } from '@/server/routers/blog/getBlogs';
import { blogThreadRouter } from '@/server/routers/blog/thread';
import { router } from '@/server/trpc';
import { renderMarkdown } from '@/utils/functional/markdown';
import { ValueReplace } from 'shared-utils';

export interface BlogPostProcedureData {
  /** The path that is going to be revalidated. */
  readonly revalidatePath: string;
  /** Prisma `include` object for blog posts that are going to be processed. */
  readonly processInclude: typeof processBlogInclude;
  /** Function that processes a blog, which was queried with `processInclude `*/
  readonly process: typeof processBlog;
  /** Function that processes a query, that also uses `processInclude `*/
  readonly processQuery: typeof processBlogQuery;
}

/** Prisma include statement for blog posts that is required for processing. */
const processBlogInclude = {
  // we include the count of `replies` and `comments` (0 row-reads)
  _count: { select: { replies: true, comments: true } },
  // // `author` not needed as of now
  // author: { select: selectAuthorFields },
} as const;

const blogProcedureEnvironment = {
  revalidatePath: '/blog',
  processInclude: processBlogInclude,
  processQuery: processBlogQuery,
  process: processBlog,
} as const satisfies BlogPostProcedureData;

export const blogRouter = router({
  threads: blogThreadRouter,
  // Blog post related
  getBlogs: createGetBlogsProcedure(blogProcedureEnvironment),
  addBlog: createAddBlogProcedure(blogProcedureEnvironment),
  editBlog: createEditBlogProcedure(blogProcedureEnvironment),
  deleteBlog: createDeleteBlogProcedure(blogProcedureEnvironment),
});

// prettier-ignore
export type BlogPostProcessCountData =
  ValueReplace<(typeof processBlogInclude)['_count']['select'], number>;

/** Function that processes a query result to a ProcessedBlogPostModel. */
async function processBlogQuery({
  _count,
  ...blogPost
}: BlogPostModel & {
  _count: BlogPostProcessCountData;
}) {
  return processBlog(blogPost, _count);
}

/** Function that processes a BlogPostModel to ProcessedBlogPostModel. */
async function processBlog(
  post: BlogPostModel,
  count: BlogPostProcessCountData
): Promise<ProcessedBlogPostModel> {
  return {
    ...post,
    totalCommentCount: count.comments + count.replies,
    commentCount: count.comments,
    htmlContent: await renderMarkdown(post.content),
  };
}