import {
  $blogThreadContent,
  $blogThreadItem,
  BlogThreadItem,
} from '@/modules/blog/blog';
import { $blogThread } from '@/modules/blog/utils/thread/blogThread';
import {
  createPermissiveMiddleware,
  rateLimitingMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure } from '@/server/trpc';
import { createErrorFromGlobal } from '@/utils/error';
import { Globals } from '@/utils/global/globals';
import { selectAuthorFields } from '@/utils/schemas/shared';
import { TRPCError } from '@trpc/server';

export const addItem = procedure
  .use(createPermissiveMiddleware('blog.thread.post'))
  .input($blogThreadContent.extend({ group: $blogThread }))
  .output($blogThreadItem)
  .use(rateLimitingMiddleware)
  .use(shallowSanitizationMiddleware)
  .mutation(async ({ input, ctx: { session } }) => {
    const { content, group } = input;
    if (!session?.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const userId = session.user.id;
    if (group.type === 'reply') {
      // we do this check first, to avoid unnecessary database row-reads,
      // as the below condition may be true often.
      const ownReplyCount = await prisma.blogReply.count({
        where: { blogId: group.blog, parentId: group.parent, authorId: userId },
      });
      if (ownReplyCount >= Globals.maxPersonalBlogReplies)
        throw createErrorFromGlobal({
          code: 'FORBIDDEN',
          message: {
            summary: `User hit the reply limit for this parent`,
            translate: 'responses.blog.reply_limit',
          },
        });
    }
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: group.blog },
      select: {
        // Select counts to determine if the total reply limit has been exceeded
        _count: { select: { replies: true, comments: true } },
        commentsDisabled: true,
        comments:
          group.type === 'reply' ? { where: { id: group.parent } } : undefined,
      },
    });
    if (!blogPost)
      throw createErrorFromGlobal({
        code: 'NOT_FOUND',
        message: {
          summary: `Blog post not found`,
          translate: 'responses.blog.not_found',
        },
      });
    if (
      blogPost._count.replies + blogPost._count.comments >
      Globals.maxTotalBlogComments
    )
      throw createErrorFromGlobal({
        code: 'FORBIDDEN',
        message: {
          summary: 'Blog already has too many replies and comments in total',
          translate: 'responses.blog.total_comment_limit',
        },
      });
    if (blogPost.commentsDisabled)
      throw createErrorFromGlobal({
        code: 'FORBIDDEN',
        message: {
          summary: 'Comments are disabled on this blog post',
          translate: 'responses.blog.replies_disabled',
        },
      });
    // The actual add-implementation
    if (group.type === 'comment') {
      const { _count, ...comment } = await prisma.blogComment.create({
        data: { content, blogId: group.blog, authorId: userId },
        include: {
          author: { select: selectAuthorFields },
          _count: { select: { replies: true } },
        },
      });
      return {
        ...comment,
        replyCount: _count.replies,
        type: 'comment',
      } satisfies BlogThreadItem;
    }
    if (!blogPost.comments.length)
      throw createErrorFromGlobal({
        code: 'NOT_FOUND',
        message: {
          summary: 'Parent cannot be found',
          translate: 'responses.blog.comment_not_found',
        },
      });
    const reply = await prisma.blogReply.create({
      data: {
        content,
        blogId: group.blog,
        authorId: userId,
        parentId: group.parent,
      },
      include: { author: { select: selectAuthorFields } },
    });
    return { ...reply, type: 'reply' } satisfies BlogThreadItem;
  });
