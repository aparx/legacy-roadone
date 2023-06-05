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
    let queried: BlogReplyModel[] | BlogCommentModel[] = [];
    if (group.type === 'comment') {
      let own: BlogCommentModel[] = [];
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
      queried = (
        await prisma.blogComment.findMany({
          where: { blogId: group.blog, id: { notIn: exclude } },
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: selectAuthorFields },
            _count: { select: { replies: true } },
          },
          skip: (cursor && Math.max(cursor - exclude.length, 0)) || 0,
          take: 1 + limit,
        })
      ).map(
        ({ _count, ...data }): BlogCommentModel => ({
          replyCount: _count.replies,
          ...data,
        })
      );
      queried.push(...own);
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
    if (userId)
      queried.sort((a, b) =>
        a.authorId === userId ? -1 : b.authorId === userId ? 0 : 1
      );
    infiniteData = queried as BlogThreadItem[];
    // possible logging logic might be inserted here for `infiniteData`
    return createInfiniteQueryResult({ cursor, limit }, { infiniteData });
  });
