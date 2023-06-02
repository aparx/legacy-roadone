import { Permission } from '@/modules/auth/utils/permission';
import {
  $blogThreadContent,
  $blogThreadItem,
  $blogThreadItemType,
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
import { $cuidField, selectAuthorFields } from '@/utils/schemas/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export type GetThreadItemsOutput = z.infer<typeof $getThreadsItemOutput>;
const $getThreadsItemOutput = createInfiniteQueryOutput($blogThreadItem);

export type DeleteThreadItemOutput = z.infer<typeof $deleteThreadItemOutput>;
const $deleteThreadItemOutput = z.object({
  item: $cuidField,
  affected: z.number(),
});

export const blogThreadRouter = router({
  getThread: procedure
    .input(
      createInfiniteQueryInput(
        Globals.commentFetchPageLimit,
        Globals.commentFetchPageLimit
      ).extend({
        group: $blogThread,
      })
    )
    .output($getThreadsItemOutput)
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

  addItem: procedure
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
      if (ownReplyCount >= Globals.maxPersonalBlogReplies)
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

  deleteItem: procedure
    .use(createPermissiveMiddleware('blog.thread.delete'))
    .input($cuidField.extend({ type: $blogThreadItemType }))
    .output($deleteThreadItemOutput)
    .use(rateLimitingMiddleware)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const { id, type } = input;
      let affected = 1;
      let root: Pick<BlogThreadItem, 'id'>;
      const requiredAuthorId = Permission.hasGlobalPermission(
        ctx.session,
        'blog.thread.manage'
      )
        ? undefined
        : ctx.session.user.id;
      if (type === 'comment') {
        const comment = await prisma.blogComment.findFirst({
          where: { id, authorId: requiredAuthorId },
          select: { id: true, _count: { select: { replies: true } } },
        });
        if (!comment)
          throw createErrorFromGlobal({
            code: 'NOT_FOUND',
            message: {
              summary: 'Cannot find comment to delete',
              translate: 'responses.blog.comment_not_found',
            },
          });
        const { _count, ...target } = comment;
        affected += _count.replies;
        root = target;
        await prisma.blogComment.delete({ where: { id } });
      } else {
        const reply = await prisma.blogReply.findFirst({
          where: { id, authorId: requiredAuthorId },
          select: { id: true },
        });
        if (!reply)
          throw createErrorFromGlobal({
            code: 'NOT_FOUND',
            message: {
              summary: 'Cannot find reply to delete',
              translate: 'responses.blog.reply_not_found',
            },
          });
        root = reply;
        await prisma.blogReply.delete({ where: { id } });
      }
      return { item: root, affected };
    }),
});
