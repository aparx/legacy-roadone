import {
  BlogReplyData,
  blogReplyParented,
  blogReplySchema,
} from '@/modules/blogs/blogReply';
import { prisma } from '@/server/prisma';
import { procedure } from '@/server/trpc';
import { infiniteQueryInput } from '@/utils/schemas/infiniteQueryInput';
import { z } from 'zod';

const getRepliesOutputSchema = z.object({
  data: blogReplySchema.array(),
  nextCursor: z.number().nullish(),
});

export type GetReplyOutput = z.infer<typeof getRepliesOutputSchema>;

export const getReplies = procedure
  .input(infiniteQueryInput.extend(blogReplyParented.shape))
  .output(getRepliesOutputSchema)
  .query(async ({ input, ctx }): Promise<GetReplyOutput> => {
    const { blogId, cursor, limit } = input;
    const userId = ctx.session?.user?.id;
    const parentId = input.parentId ?? null;
    const replies = await prisma.$transaction(async (tx) => {
      const replies: BlogReplyData[] = [];
      if (userId) {
        // Since anyone can only have up to max. one reply for each depth, we can
        // simply find first for better performance.
        const ownReply = await tx.blogReply.findFirst({
          where: { blogId: blogId, authorId: userId, parentId },
          include: { author: true },
        });
        if (ownReply) replies.push(ownReply);
      }
      return [
        ...replies,
        ...(await tx.blogReply.findMany({
          where: {
            id: { notIn: replies.map((r) => r.id) },
            blogId: blogId,
            parentId,
            blog: { repliesDisabled: false },
          },
          include: { author: true },
          skip: cursor,
          take: 1 + limit,
        })),
      ];
    });
    let nextCursor: number | undefined;
    if (replies && replies.length > limit) {
      replies.splice(limit, replies.length);
      nextCursor = cursor + limit;
    }
    // Anchor insertion must happen on client side
    return { data: replies ?? [], nextCursor };
  });
