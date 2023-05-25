import { Permission } from '@/modules/auth/utils/permission';
import '@/modules/blogs/blogPost';
import {
  blogReplyContentSchema,
  BlogReplyData,
  blogReplySchema,
} from '@/modules/blogs/blogReply';
import {
  createPermissiveMiddleware,
  rateLimitingMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { Globals } from '@/utils/global/globals';
import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { infiniteQueryInput } from '@/utils/schemas/infiniteQueryInput';
import { TRPCError } from '@trpc/server';
import { DeepCircularObject, ObjectConjunction } from 'shared-utils';
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

export type ReplyNodePropertySelection<TExclude extends string = never> =
  Exclude<keyof BlogReplyData, TExclude>;

export type SelectReplyNodeProperties<TExclude extends string = never> =
  Partial<Record<ReplyNodePropertySelection<TExclude>, true>>;

export type DepthReplyNode<
  TKey extends string,
  TSelection extends SelectReplyNodeProperties<TKey>
> = {
  [P in keyof TSelection]: P extends keyof BlogReplyData
    ? BlogReplyData[P]
    : never;
} & Partial<Record<TKey, DepthReplyNode<TKey, TSelection>[]>>;

export type ProgressiveReplyDepthBuilder<
  TKey extends string,
  TSelection extends SelectReplyNodeProperties<TKey>
> = {
  select: ObjectConjunction<
    Record<keyof DepthReplyNode<TKey, TSelection>, true>,
    Partial<Record<TKey, ProgressiveReplyDepthBuilder<TKey, TSelection>>>
  >;
};

// TODO move to a separate utility
export function createDeepDepthSelectTree<
  TKey extends string,
  TSelection extends SelectReplyNodeProperties<TKey>
>(key: TKey, select: TSelection, depth: number = 1 + Globals.maxReplyDepth) {
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
    .use(shallowSanitizationMiddleware)
    .mutation(async ({ input, ctx }): Promise<BlogReplyData> => {
      if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const { blogId, parentId, content } = input;

      // Before the `depth` property, the entire depth-tree was queried, which may
      // have resulted in issues in the future. To further future-proof, we include a
      // `depth` in the data for now.
      const parent = await prisma.blogReply.findFirst({
        where: { blogId, id: parentId ?? undefined },
        select: { id: true, depth: true },
      });
      if (!parent && parentId) throw new TRPCError({ code: 'NOT_FOUND' });
      let depth = parent?.depth ? 1 + parent.depth : 1;
      if (depth > Globals.maxReplyDepth)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reply depth exceeded',
        });
      // Check if comment exists
      const sequence: any[] = [
        prisma.blogReply.create({
          data: {
            blogId,
            parentId,
            content,
            authorId: ctx.session.user.id,
            depth,
          },
        }),
      ];
      if (parentId) {
        sequence.push(
          prisma.blogReply.update({
            where: { id: parentId },
            data: { replyCount: { increment: 1 } },
          }),
          // Increment the post's total reply count
          prisma.blogPost.update({
            where: { id: blogId },
            data: { totalReplyCount: { increment: 1 } },
          })
        );
      } else {
        sequence.push(
          prisma.blogPost.update({
            where: { id: blogId },
            data: {
              replyCount: { increment: 1 },
              totalReplyCount: { increment: 1 },
            },
          })
        );
      }
      return (await prisma.$transaction(sequence))[0] as BlogReplyData;
    }),

  deleteReply: procedure
    .input(cuidSchema)
    .use(createPermissiveMiddleware('blog.comment.post'))
    .use(rateLimitingMiddleware)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { session } = ctx;
      const reply = await prisma.blogReply.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          parentId: true,
          blogId: true,
          replies: createDeepDepthSelectTree('replies', {
            id: true,
            parentId: true,
          }),
        },
      });
      if (!reply) throw new TRPCError({ code: 'NOT_FOUND' });
      if (
        !Permission.hasGlobalPermission(session, 'blog.reply.ownAll') &&
        reply.authorId !== session?.user?.id
      ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return deleteReplyNode({ node: reply, type: 'reply' });
    }),
});

// prettier-ignore
type DeepRepliesObject<TData> = DeepCircularObject<
  'replies', TData, { asArray: true; partial: true }
>;

/***
 * A deletable reply node may be a `BlogReply` or a `BlogPost`.
 */
type UniReplyNode =
  | {
      type: 'reply';
      node: DeepRepliesObject<{
        id: string;
        blogId: string;
        parentId?: string | undefined | null;
      }>;
    }
  | {
      type: 'blog';
      node: DeepRepliesObject<{
        id: string;
      }>;
    };

/**
 * Deletes given node and all its children (first).
 * The reply node can either be a `BlogReply` or `BlogPost`, since both schemas can
 * contain `replies` in their data and also share the `replyCount` attribute.
 */
export async function deleteReplyNode(root: UniReplyNode) {
  const { node, type } = root;
  // Delete parents in reverse due to the nature of cyclic referential actions
  let { parents: sections, count } = collectReplyParents(root);
  sections = sections.reverse();
  let itemCount = count;
  if (type === 'blog') {
    const _length = sections.length;
    sections.splice(-1, 1); // remove `root` from the parents `in-place`
    itemCount += _length - sections.length;
  } else if (!sections.length) sections.push(root);
  const sequence: any[] = sections.flatMap(({ node, type }) => [
    // First we delete all children of `parents`
    prisma.blogReply.deleteMany({
      where: {
        parentId: type === 'reply' ? node.id : undefined,
        blogId: type === 'blog' ? node.id : node.blogId,
      },
    }),
    // Secondly, we delete the actual parent itself
    prisma.blogReply.delete({ where: { id: node.id } }),
  ]);
  // Update parent's counter
  if (type === 'reply')
    sequence.push(
      node.parentId
        ? prisma.blogReply.update({
            where: { id: node.parentId },
            data: { replyCount: { decrement: 1 } },
          })
        : prisma.blogPost.update({
            where: { id: node.blogId },
            data: { replyCount: { decrement: 1 } },
          })
    );
  if (type === 'blog')
    sequence.push(prisma.blogPost.delete({ where: { id: node.id } }));
  else
    sequence.push(
      prisma.blogPost.update({
        where: { id: node.blogId },
        data: {
          totalReplyCount: { decrement: itemCount },
        },
      })
    );
  return prisma
    .$transaction(sequence)
    .then(() => ({ deleted: itemCount, root }));
}

function collectReplyParents(node: UniReplyNode, count: number = 0) {
  return recursiveReplyParentsCollect(node, { count, parents: [] });
}

function recursiveReplyParentsCollect(
  uniNode: UniReplyNode,
  result: { count: number; parents: UniReplyNode[] }
) {
  const { node } = uniNode;
  result.count++;
  if (!node.replies?.length) return result;
  result.parents.push(uniNode);
  node.replies.forEach((node) =>
    recursiveReplyParentsCollect({ node, type: 'reply' }, result)
  );
  return result;
}
