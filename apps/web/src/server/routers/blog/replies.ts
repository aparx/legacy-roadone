import { Permission } from '@/modules/auth/utils/permission';
import '@/modules/blogs/blogPost';
import {
  blogReplyContentSchema,
  BlogReplyData,
  blogReplySchema,
} from '@/modules/blogs/blogReply';
import {
  createPermissiveMiddleware,
  fullSanitizationMiddleware,
  rateLimitingMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { Globals } from '@/utils/global/globals';
import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { infiniteQueryInput } from '@/utils/schemas/infiniteQueryInput';
import { TRPCError } from '@trpc/server';
import { ObjectConjunction } from 'shared-utils';
import { DeepPartial } from 'utility-types';
import { z } from 'zod';

const commentParent = z.object({
  blogId: z.string().cuid(),
  /** Parent being another comment; can never be a blog */
  parentId: z.string().cuid().nullish().optional(),
});

const getRepliesInputSchema = infiniteQueryInput.extend(commentParent.shape);

const addCommentInputSchema = commentParent.extend(
  blogReplyContentSchema.shape
);

export type GetCommentsInput = z.infer<typeof getRepliesInputSchema>;

const getRepliesOutputSchema = z.object({
  data: blogReplySchema.array(),
  nextCursor: z.number().nullish(),
});

export type GetReplyOutput = z.infer<typeof getRepliesOutputSchema>;
export type AddReplyInput = z.infer<typeof addCommentInputSchema>;

type DeletableReplyNode = {
  id: string;
  replies?: DeletableReplyNode[];
  authorId?: string | null;
  parentId?: string | null;
  blogId?: string | null;
};

type ProgressiveReplyDepthBuilder = {
  select: ObjectConjunction<
    Partial<Record<keyof DeletableReplyNode, true>>,
    { replies?: ProgressiveReplyDepthBuilder }
  >;
};

export const blogReplyRouter = router({
  getReplies: procedure
    .input(getRepliesInputSchema)
    .output(getRepliesOutputSchema)
    .query(async ({ input, ctx }): Promise<GetReplyOutput> => {
      const { blogId, parentId, cursor, limit } = input;
      const userId = ctx.session?.user?.id;
      let replyArray: BlogReplyData[] = [];
      if (Globals.prioritiseSelfReplies && userId) {
        // Always prioritise the user's own reply first.
        const self = (
          await prisma.blogPost.findFirst({
            where: {
              id: blogId,
              repliesDisabled: false,
            },
            select: {
              replies: {
                where: {
                  authorId: userId,
                  parentId: parentId ?? null,
                },
                skip: cursor,
                take: 1,
                include: { author: true },
              },
            },
          })
        )?.replies;
        if (self) replyArray.push(...self);
      }
      const found = (
        await prisma.blogPost.findFirst({
          where: {
            id: blogId,
            repliesDisabled: false,
          },
          select: {
            replies: {
              where: {
                id: {
                  notIn: replyArray.length
                    ? replyArray.map((r) => r.id)
                    : undefined,
                },
                parentId: parentId ?? null,
              },
              skip: cursor,
              take: limit + 1,
              include: { author: true },
            },
          },
        })
      )?.replies;
      if (found) replyArray.push(...found);
      let nextCursor: number | undefined;
      if (replyArray && replyArray.length > limit) {
        replyArray.pop();
        nextCursor = cursor + limit;
      }
      return { data: replyArray ?? [], nextCursor };
    }),
  addReply: procedure
    .input(addCommentInputSchema)
    .use(createPermissiveMiddleware('blog.comment.post'))
    .use(rateLimitingMiddleware)
    .use(fullSanitizationMiddleware)
    .mutation(async ({ input, ctx }): Promise<BlogReplyData> => {
      if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const { blogId, parentId, content } = input;
      const transactions = [
        prisma.blogReply.create({
          data: { blogId, parentId, content, authorId: ctx.session.user.id },
        }),
        // Increment the post's total reply count
        prisma.blogPost.update({
          where: { id: blogId },
          data: { replyCount: { increment: 1 } },
        }),
      ];
      if (parentId) {
        transactions.push(
          prisma.blogReply.update({
            where: { id: parentId },
            data: { replyCount: { increment: 1 } },
          })
        );
      }
      return (await prisma.$transaction(transactions))[0] as BlogReplyData;
    }),
  deleteReply: procedure
    .input(cuidSchema)
    .use(createPermissiveMiddleware('blog.comment.post'))
    .use(rateLimitingMiddleware)
    .mutation(async ({ input, ctx }) => {
      const { session } = ctx;
      const { id } = input;
      let deepReplySelectTree: DeepPartial<ProgressiveReplyDepthBuilder> = {};
      for (let depth = 0; depth < Globals.maxReplyDepth; ++depth) {
        deepReplySelectTree = {
          select: {
            id: true,
            replies: depth === 0 ? undefined : { ...deepReplySelectTree },
          },
        };
      }
      const root = await prisma.blogReply.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          parentId: true,
          blogId: true,
          replies: deepReplySelectTree,
        },
      });
      if (!root) throw new TRPCError({ code: 'NOT_FOUND' });
      if (
        !Permission.hasGlobalPermission(session, 'blog.reply.ownAll') &&
        root.authorId !== session?.user?.id
      ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const reverseTree = createDeleteTree(root);
      const numberTransactions: any[] = [];
      if (root.parentId) {
        numberTransactions.push(
          prisma.blogReply.update({
            where: { id: root.parentId },
            data: { replyCount: { decrement: reverseTree.length } },
          })
        );
      }
      await prisma.$transaction([
        ...reverseTree.map(({ id }) =>
          prisma.blogReply.delete({ where: { id } })
        ),
        ...numberTransactions,
        prisma.blogPost.update({
          where: { id: root.blogId },
          data: { replyCount: { decrement: reverseTree.length } },
        }),
      ]);
    }),
});

function createDeleteTree(root: DeletableReplyNode) {
  return _collectDeleteTree(root, []).reverse();
}

function _collectDeleteTree(
  reply: DeletableReplyNode,
  tree: DeletableReplyNode[]
) {
  tree.push(reply);
  if (!reply.replies) return tree;
  reply.replies.forEach((reply) => _collectDeleteTree(reply, tree));
  return tree;
}
