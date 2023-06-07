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

export type GetThreadInput = z.infer<typeof $getThreadInput>;
const $getThreadInput = createInfiniteQueryInput(
  Globals.commentFetchPageLimit,
  Globals.commentFetchPageLimit
).extend({
  group: $blogThread,
});

export const getThread = procedure
  .input($getThreadInput)
  .output($getThreadOutput)
  .query(async ({ input, ctx }) => {
    const userId = ctx.session?.user?.id;
    let { cursor, limit, group } = input;
    let queried: BlogReplyModel[] | BlogCommentModel[];
    let own: BlogCommentModel[] | BlogReplyModel[] = [];
    let exclude: string[] = [];
    if (group.type === 'comment' && userId) {
      let _own: any;
      if (cursor) {
        // `self` must only contain id to reduce unnecessary reads
        _own = await prisma.blogComment.findFirst({
          where: { blogId: group.blog, authorId: userId },
          select: { id: true },
        });
      } else {
        // `self` must be applicable to `BlogCommentModel` & _count
        _own = await prisma.blogComment.findFirst({
          where: { blogId: group.blog, authorId: userId },
          include: {
            author: { select: selectAuthorFields },
            _count: { select: { replies: true } },
          },
        });
      }
      if (_own) exclude.push(_own.id);
      if (_own && !cursor) {
        const { _count, ...data } = _own;
        own = [{ ...data, replyCount: _count.replies }];
      }
    } else if (group.type === 'reply' && userId) {
      let _own: any[];
      if (cursor) {
        _own = await prisma.blogReply.findMany({
          where: {
            blogId: group.blog,
            authorId: userId,
            parentId: group.parent,
          },
          select: { id: true },
          take: Globals.maxPersonalBlogReplies,
        });
      } else {
        _own = await prisma.blogReply.findMany({
          where: {
            blogId: group.blog,
            authorId: userId,
            parentId: group.parent,
          },
          orderBy: { createdAt: 'desc' },
          include: { author: { select: selectAuthorFields } },
          take: Globals.maxPersonalBlogReplies,
        });
      }
      if (_own) exclude = _own.map((i) => i.id);
      if (_own && !cursor) own = _own;
    }
    queried = [...own, ...(await fetchForeign(input, exclude, own))];
    queried.forEach((x) => ((x as BlogThreadItem).type = group.type));
    const infiniteData = queried as BlogThreadItem[];
    const res = createInfiniteQueryResult({ cursor, limit }, { infiniteData });
    // sort after (possible) splicing
    res.data.sort((a, b) => {
      return a.authorId === userId ? -1 : b.authorId === userId ? 0 : 1;
    });
    return res;
  });

/**
 * Simply fetches `data` and excludes all replies or comments with an ID that is
 * contained in `exclusiveOwns`. The queries will skip `data`.`cursor` minus the
 * length of `exclude`.
 *
 * This function has `foreign` in its name, since this function is primarily used in
 * context with already self owning data (so items that the requesting user already owns).
 * This means that this function's main task is to fetch thread items posted by foreign
 * users within the thread. Both optional arguments (`exclusiveOwns` and `freshPageData`)
 * are arrays that resemble the requesters own replies or comments in most cases for
 * the current input pagination.
 *
 * @param data the input data required to fetch the corresponding page
 * @param exclusiveOwns all identifiers that shall be excluded (already fetched data)
 * @param freshPageData array of all already fetched data (possibly a subset of `exclusiveOwns`)
 */
async function fetchForeign(
  data: GetThreadInput,
  exclusiveOwns?: string[],
  freshPageData?: any[]
) {
  const { group, cursor, limit } = data;
  const dataLength = freshPageData?.length ?? 0;
  const owningLength = exclusiveOwns?.length ?? 0;
  if (group.type === 'reply') {
    // Fetch replies
    return await prisma.blogReply.findMany({
      where: {
        blogId: group.blog,
        parentId: group.parent,
        id: { notIn: exclusiveOwns },
      },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: selectAuthorFields } },
      skip: Math.max(cursor - owningLength, 0),
      take: 1 + limit - dataLength,
    });
  }
  // Fetch comments
  return (
    await prisma.blogComment.findMany({
      where: { blogId: group.blog, id: { notIn: exclusiveOwns } },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: selectAuthorFields },
        _count: { select: { replies: true } },
      },
      skip: Math.max(cursor - owningLength, 0),
      take: 1 + limit - dataLength,
    })
  ).map(
    ({ _count, ...data }): BlogCommentModel => ({
      replyCount: _count.replies,
      ...data,
    })
  );
}
