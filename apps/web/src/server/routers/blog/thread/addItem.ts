import {
  $blogThreadContent,
  $blogThreadItem,
  BlogCommentModel,
  BlogReplyModel,
  BlogThreadItem,
} from '@/modules/blog/blog';
import { $blogThread } from '@/modules/blog/utils/thread/blogThread';
import {
  createPermissiveMiddleware,
  shallowSanitizationMiddleware,
  sharedRateLimiterMiddlewareFactory,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure } from '@/server/trpc';
import { createErrorFromGlobal } from '@/utils/error';
import { Globals } from '@/utils/global/globals';
import { selectAuthorFields } from '@/utils/schemas/shared';
import { TRPCError } from '@trpc/server';

export const addItem = procedure
  .use(sharedRateLimiterMiddlewareFactory(15))
  .use(createPermissiveMiddleware('blog.thread.post'))
  .input($blogThreadContent.extend({ group: $blogThread }))
  .output($blogThreadItem)
  .use(shallowSanitizationMiddleware)
  .mutation(async ({ input, ctx: { session } }) => {
    // 1. Check for the blog post
    // 2. Ensure right reply count boundaries
    // 3. Ensure total comment count boundaries
    // 4. Ensure comments being enabled
    // 5. Ensure comment is existing
    if (!session?.user?.id)
      // If ever reached, the permissive middleware failed
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    const { content, group } = input;
    const { blog, type } = group;
    const userId = session.user.id;
    return prisma.$transaction(async (tx) => {
      let entry: BlogReplyModel | BlogCommentModel;
      if (type === 'comment') {
        entry = await tx.blogComment.create({
          data: {
            content,
            blog: { connect: { id: blog } },
            author: { connect: { id: userId } },
          },
          include: { author: { select: selectAuthorFields } },
        });
      } else {
        entry = await tx.blogReply.create({
          data: {
            content,
            blog: { connect: { id: blog } },
            parent: { connect: { id: group.parent } },
            author: { connect: { id: userId } },
          },
          include: { author: { select: selectAuthorFields } },
        });
        // we use a separate query to perform COUNT(*) due to the excessive query the
        // above would be if we would include the parent's count of replies with a
        // where clause, potentially leading to unnecessary row reads.
        const replyCount = await tx.blogReply.count({
          where: { blogId: blog, parentId: group.parent, authorId: userId },
        });
        if (replyCount > Globals.maxPersonalBlogReplies)
          throw createErrorFromGlobal({
            code: 'FORBIDDEN',
            message: {
              summary: 'User has reached personal reply limit',
              translate: 'responses.blog.reply_limit',
            },
          });
      }
      const blogPost = await tx.blogPost.findFirst({
        where: { id: blog },
        select: {
          id: true,
          commentsDisabled: true,
          _count: {
            select: {
              replies: true,
              comments: true,
            },
          },
        },
      });
      if (!blogPost)
        throw createErrorFromGlobal({
          code: 'NOT_FOUND',
          message: {
            summary: 'Blog post not found',
            translate: 'responses.blog.not_found',
          },
        });
      if (blogPost.commentsDisabled)
        throw createErrorFromGlobal({
          code: 'FORBIDDEN',
          message: {
            summary: 'Comments are currently disabled',
            translate: 'responses.blog.replies_disabled',
          },
        });
      if (
        blogPost._count.replies + blogPost._count.comments >
        Globals.maxTotalBlogComments
      ) {
        throw createErrorFromGlobal({
          code: 'FORBIDDEN',
          message: {
            summary: 'User has reached total comment limit',
            translate: 'responses.blog.total_comment_limit',
          },
        });
      }
      return { ...entry, type: group.type } as BlogThreadItem;
    });
  });