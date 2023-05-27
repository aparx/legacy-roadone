import { Permission } from '@/modules/auth/utils/permission';
import {
  createPermissiveMiddleware,
  rateLimitingMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import {
  createDeepSelectTree,
  deleteReplyNode,
} from '@/server/routers/blog/replies/index';
import { procedure } from '@/server/trpc';
import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { TRPCError } from '@trpc/server';

export const deleteReply = procedure
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
        replies: createDeepSelectTree('replies', { id: true, parentId: true }),
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
  });
