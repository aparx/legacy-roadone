import { $blogThread } from '@/modules/blog/utils/thread/blogThread';
import { createRoleMiddleware } from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

/**
 * Query that returns the amount of replies or comments the requesting user owns
 * within the input `group` (being the target thread [i.e. group of comments]).
 */
export const count = procedure
  .use(createRoleMiddleware('USER'))
  .input(z.object({ group: $blogThread }))
  .query(async ({ input, ctx }) => {
    const { group } = input;
    const user = ctx.session?.user?.id;
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return group.type === 'reply'
      ? await prisma.blogReply.count({
          where: {
            blogId: group.blog,
            parentId: group.parent,
            authorId: user,
          },
        })
      : await prisma.blogComment.count({
          where: { blogId: group.blog, authorId: user },
        });
  });
