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

type ReplyNodePropertySelection<
  TExclude extends string | undefined = undefined
> = TExclude extends undefined
  ? keyof BlogReplyData
  : Exclude<keyof BlogReplyData, TExclude>;

type SelectReplyNodeProperties<
  TExclude extends string | undefined = undefined
> = Partial<Record<ReplyNodePropertySelection<TExclude>, true>>;

type DepthReplyNode<
  TKey extends string,
  TSelection extends SelectReplyNodeProperties<TKey>
> = { [P in keyof BlogReplyData]?: TSelection | undefined | null } & Partial<
  Record<TKey, DepthReplyNode<TKey, TSelection>[]>
>;

type ProgressiveReplyDepthBuilder<
  TKey extends string,
  TSelection extends SelectReplyNodeProperties<TKey>
> = {
  select: ObjectConjunction<
    Partial<Record<keyof DepthReplyNode<TKey, TSelection>, true>>,
    Partial<Record<TKey, ProgressiveReplyDepthBuilder<TKey, TSelection>>>
  >;
};

function createDeepDepthSelectTree<
  TKey extends string,
  TSelection extends SelectReplyNodeProperties<TKey>
>(key: TKey, select: TSelection, depth: number = Globals.maxReplyDepth) {
  let deepSelectTree: ProgressiveReplyDepthBuilder<TKey, TSelection> = {
    select: select as any,
  };
  for (let i = 0; i < depth; ++i) {
    deepSelectTree = {
      select: {
        ...select,
        [key]: i === 0 ? undefined : { ...deepSelectTree },
      } as any,
    };
  }
  return deepSelectTree;
}

export const blogReplyRouter = router({
  getReplies: procedure
    .input(getRepliesInputSchema)
    .output(getRepliesOutputSchema)
    .query(async ({ input }): Promise<GetReplyOutput> => {
      const { blogId, parentId, cursor, limit } = input;
      let replyArray: BlogReplyData[] = [];
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
        replyArray.splice(limit, replyArray.length);
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
      // Before the `depth` property, the entire depth-tree was queried, which may
      // have resulted in issues in the future. To further future-proof, we include a
      // `depth` in the data for now.
      const parent = await prisma.blogReply.findFirst({
        where: { blogId, id: parentId ?? undefined },
        select: { depth: true },
      });
      if (!parent && parentId) throw new TRPCError({ code: 'NOT_FOUND' });
      let depth = parent?.depth ? 1 + parent.depth : 0;
      if (depth > Globals.maxReplyDepth)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reply depth exceeded',
        });
      const transactions = [
        prisma.blogReply.create({
          data: {
            blogId,
            parentId,
            content,
            authorId: ctx.session.user.id,
            depth,
          },
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
      const root = await prisma.blogReply.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          parentId: true,
          blogId: true,
          replies: createDeepDepthSelectTree('replies', { id: true }),
        },
      });
      if (!root) throw new TRPCError({ code: 'NOT_FOUND' });
      if (
        !Permission.hasGlobalPermission(session, 'blog.reply.ownAll') &&
        root.authorId !== session?.user?.id
      ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      // Sequential deletion tree, that is in right order (reversed)
      const tree = createDeleteTree(root);
      const parentTransactions: any[] = [];
      if (root.parentId)
        parentTransactions.push(
          prisma.blogReply.update({
            where: { id: root.parentId },
            data: { replyCount: { decrement: tree.length } },
          })
        );
      await prisma.$transaction([
        ...tree.map(({ id }) => prisma.blogReply.delete({ where: { id } })),
        ...parentTransactions,
        prisma.blogPost.update({
          where: { id: root.blogId },
          data: { replyCount: { decrement: tree.length } },
        }),
      ]);
      return { deleteCount: tree.length, tree: root };
    }),
});

function createDeleteTree<TRoot extends DepthReplyNode<'replies', any>>(
  root: TRoot
) {
  return collectRepliesTree(root, []).reverse();
}

function collectRepliesTree<TNode extends DepthReplyNode<'replies', any>>(
  reply: TNode,
  tree: TNode[]
) {
  tree.push(reply);
  if (!reply.replies) return tree;
  reply.replies.forEach((reply) => collectRepliesTree(reply, tree));
  return tree;
}
