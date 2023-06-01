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
  rateLimitingMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { createErrorFromGlobal } from '@/utils/error';
import { Globals } from '@/utils/global/globals';
import {
  createInfiniteQueryInput,
  createInfiniteQueryOutput,
  createInfiniteQueryResult,
} from '@/utils/schemas/infiniteQuery';
import { selectAuthorFields } from '@/utils/schemas/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export type GetThreadItemsOutput = z.infer<typeof getThreadsItemOutput>;
const getThreadsItemOutput = createInfiniteQueryOutput($blogThreadItem);

export const blogThreadRouter = router({
  getThreadItems: procedure
    .input(createInfiniteQueryInput(10, 3).extend({ group: $blogThread }))
    .output(getThreadsItemOutput)
    .query(async ({ input }) => {
      const { cursor, limit, group } = input;
      let infiniteData: BlogThreadItem[];
      let queried: BlogReplyModel[] | BlogCommentModel[];
      if (group.type === 'comment') {
        queried = (
          await prisma.blogComment.findMany({
            where: { blogId: group.blog },
            orderBy: { createdAt: 'desc' },
            include: {
              author: { select: selectAuthorFields },
              _count: { select: { replies: true } },
            },
            skip: cursor,
            take: 1 + limit,
          })
        ).map(
          ({ _count, ...data }): BlogCommentModel => ({
            replyCount: _count.replies,
            ...data,
          })
        );
      } else {
        queried = await prisma.blogReply.findMany({
          where: { blogId: group.blog, parentId: group.parent },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: selectAuthorFields } },
          skip: cursor,
          take: 1 + limit,
        });
      }
      queried.forEach((x) => ((x as BlogThreadItem).type = group.type));
      infiniteData = queried as BlogThreadItem[];
      // possible logging logic might be inserted here for `infiniteData`
      return createInfiniteQueryResult({ cursor, limit }, { infiniteData });
    }),

  addThreadItem: procedure
    .use(createPermissiveMiddleware('blog.thread.post'))
    .input($blogThreadContent.extend({ group: $blogThread }))
    .output($blogThreadItem)
    .use(rateLimitingMiddleware)
    .use(shallowSanitizationMiddleware)
    .mutation(async ({ input, ctx: { session } }) => {
      const { content, group } = input;
      if (!session?.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: group.blog },
        select: {
          // Select counts to determine if the total reply limit has been exceeded
          _count: { select: { replies: true, comments: true } },
          commentsDisabled: true,
          comments:
            group.type === 'reply'
              ? { where: { id: group.parent } }
              : undefined,
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
          data: { content, blogId: group.blog, authorId: session.user.id },
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
      // The amount of replies the user posted under this comment
      const ownReplyCount = await prisma.blogReply.count({
        where: {
          blogId: group.blog,
          parentId: group.parent,
          authorId: session.user.id,
        },
      });
      if (ownReplyCount > Globals.maxPersonalBlogReplies)
        throw createErrorFromGlobal({
          code: 'FORBIDDEN',
          message: {
            summary: 'User hit the reply limit for this parent',
            translate: 'responses.blog.reply_limit',
          },
        });
      const reply = await prisma.blogReply.create({
        data: {
          content,
          blogId: group.blog,
          authorId: session.user.id,
          parentId: group.parent,
        },
        include: { author: { select: selectAuthorFields } },
      });
      return { ...reply, type: 'reply' } satisfies BlogThreadItem;
    }),
});
