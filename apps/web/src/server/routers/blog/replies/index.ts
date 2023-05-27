import '@/modules/blogs/blogPost';
import { BlogReplyData } from '@/modules/blogs/blogReply';
import { prisma } from '@/server/prisma';
import { addReply } from '@/server/routers/blog/replies/addReply';
import { deleteReply } from '@/server/routers/blog/replies/deleteReply';
import { getReplies } from '@/server/routers/blog/replies/getReplies';
import { router } from '@/server/trpc';
import { Globals } from '@/utils/global/globals';
import { DeepCircularObject, ObjectConjunction } from 'shared-utils';

/** /blog/replies/** router */
export const blogReplyRouter = router({
  getReplies,
  addReply,
  deleteReply,
});

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
export function createDeepSelectTree<
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

// <============================================>
//     REPLY DELETION HANDLERS AND UTILITIES
// <============================================>

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
        // blogId: string;
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
  if (!sections.length && type !== 'blog') sections.push(root);
  else if (type === 'blog') ++count; // blog itself also counts as a deleted item
  // Map each section with sequential deletion queries
  const seq: any[] = sections.flatMap(({ node, type }) => [
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
    seq.push(
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
    seq.push(prisma.blogPost.delete({ where: { id: node.id } }));
  else
    seq.push(
      prisma.blogPost.update({
        where: { id: node.blogId },
        data: {
          totalReplyCount: { decrement: count },
        },
      })
    );
  return prisma.$transaction(seq).then(() => ({ deleted: count, root }));
}

function collectReplyParents(node: UniReplyNode, count: number = 0) {
  return recursiveReplyParentsCollect(node, node, { count, parents: [] });
}

function recursiveReplyParentsCollect(
  uniNode: UniReplyNode,
  root: UniReplyNode,
  result: { count: number; parents: UniReplyNode[] }
) {
  const { type, node } = uniNode;
  result.count++;
  if (!node.replies?.length) return result;
  // We will get duplicates with type `blog`, because blogs contain ALL
  // replies on any depth - meaning replies may occur twice leading to a
  // transaction failure, to mitigate this issue, we filter for duplicates.
  if (
    type !== 'blog' &&
    (root.type !== 'blog' ||
      // this isn't really efficient being O(n log n) but it is fine for now,
      // since blog mutations (specifically "deletions") do not happen frequently
      !result.parents.find((v) => v.node.id === node.id))
  ) {
    result.parents.push(uniNode);
  }
  node.replies.forEach((itr) =>
    recursiveReplyParentsCollect({ node: itr, type: 'reply' }, root, result)
  );
  return result;
}
