import {
  $blogThreadItem,
  BlogCommentModel,
  BlogReplyModel,
  BlogThreadItem,
} from '@/modules/blog/blog';
import { $blogThread } from '@/modules/blog/utils/thread/blogThread';
import { prisma } from '@/server/prisma';
import { procedure } from '@/server/trpc';
import { Globals } from '@/utils/global/globals';
import {
  createInfiniteQueryInput,
  createInfiniteQueryOutput,
  createInfiniteQueryResult,
} from '@/utils/schemas/infiniteQuery';
import { selectAuthorFields } from '@/utils/schemas/shared';
import { z } from 'zod';

export type GetThreadOutput = z.infer<typeof $getThreadOutput>;
const $getThreadOutput = createInfiniteQueryOutput($blogThreadItem);

export const getThread = procedure
  .input(
    createInfiniteQueryInput(
      Globals.commentFetchPageLimit,
      Globals.commentFetchPageLimit
    ).extend({
      group: $blogThread,
    })
  )
  .output($getThreadOutput)
  .query(async ({ input, ctx }) => {
    const userId = ctx.session?.user?.id;
    let { cursor, limit, group } = input;
    let infiniteData: BlogThreadItem[];
    let queried: BlogReplyModel[] | BlogCommentModel[];
    let own: BlogCommentModel[] | BlogReplyModel[] = [];
    if (group.type === 'comment') {
      let exclude: string[] = [];
      if (userId) {
        let self: any;
        if (cursor) {
          // `self` must only contain id to reduce unnecessary reads
          self = await prisma.blogComment.findFirst({
            where: { blogId: group.blog, authorId: userId },
            select: { id: true },
          });
        } else {
          // `self` must be applicable to `BlogCommentModel` & _count
          self = await prisma.blogComment.findFirst({
            where: { blogId: group.blog, authorId: userId },
            include: {
              author: { select: selectAuthorFields },
              _count: { select: { replies: true } },
            },
          });
        }
        if (self) exclude.push(self.id);
        if (self && !cursor) {
          const { _count, ...data } = self;
          own = [{ ...data, replyCount: _count.replies }];
        }
      }
      queried = [
        ...own,
        ...(
          await prisma.blogComment.findMany({
            where: { blogId: group.blog, id: { notIn: exclude } },
            orderBy: { createdAt: 'desc' },
            include: {
              author: { select: selectAuthorFields },
              _count: { select: { replies: true } },
            },
            skip: (cursor && Math.max(cursor - exclude.length, 0)) || 0,
            take: 1 + limit - own.length,
          })
        ).map(
          ({ _count, ...data }): BlogCommentModel => ({
            replyCount: _count.replies,
            ...data,
          })
        ),
      ];
    } else {
      let ownExclude: string[] = [];
      if (userId) {
        let self: any[];
        if (cursor) {
          // `self` must only contain id to reduce unnecessary reads
          self = await prisma.blogReply.findMany({
            where: {
              blogId: group.blog,
              authorId: userId,
              parentId: group.parent,
            },
            select: { id: true },
            take: Globals.maxPersonalBlogReplies,
          });
        } else {
          // `self` must be applicable to `BlogCommentModel` & _count
          self = await prisma.blogReply.findMany({
            where: {
              blogId: group.blog,
              authorId: userId,
              parentId: group.parent,
            },
            orderBy: { createdAt: 'asc' },
            include: { author: { select: selectAuthorFields } },
            take: Globals.maxPersonalBlogReplies,
          });
        }
        if (self) ownExclude = self.map((i) => i.id);
        if (self && !cursor) own = self;
      }
      queried = own;
      queried.push(
        ...(await prisma.blogReply.findMany({
          where: {
            blogId: group.blog,
            parentId: group.parent,
            id: { notIn: ownExclude },
          },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: selectAuthorFields } },
          skip: Math.max(cursor - ownExclude.length, 0),
          take: 1 + limit,
        }))
      );
    }
    queried.forEach((x) => ((x as BlogThreadItem).type = group.type));
    infiniteData = queried as BlogThreadItem[];
    const queryResult = createInfiniteQueryResult(
      { cursor, limit },
      { infiniteData }
    );
    // sort after (possible) splicing
    queryResult.data.sort((a, b) =>
      a.authorId === userId ? -1 : b.authorId === userId ? 0 : 1
    );
    return queryResult;
  });
