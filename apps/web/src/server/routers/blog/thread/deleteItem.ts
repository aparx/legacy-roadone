import { Permission } from '@/modules/auth/utils/permission';
import { $blogThreadItemType, BlogThreadItem } from '@/modules/blog/blog';
import {
  createPermissiveMiddleware,
  sharedRateLimiterMiddlewareFactory,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure } from '@/server/trpc';
import { createErrorFromGlobal } from '@/utils/error';
import { $cuidField } from '@/utils/schemas/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export type DeleteThreadItemOutput = z.infer<typeof $deleteThreadItemOutput>;
const $deleteThreadItemOutput = z.object({
  item: $cuidField.extend({ parentId: z.string().nullish().optional() }),
  affected: z.number(),
});

export const deleteItem = procedure
  .use(sharedRateLimiterMiddlewareFactory(15))
  .use(createPermissiveMiddleware('blog.thread.delete'))
  .input($cuidField.extend({ type: $blogThreadItemType }))
  .output($deleteThreadItemOutput)
  .mutation(async ({ input, ctx }) => {
    // 1. Authorization
    //    a) Ensure same comment author & existence of comment
    //    b) Ensure blog post has replies enabled (OPTIONAL) - NOT IMPLEMENTED
    // 2. Final deletion
    if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const { id, type } = input;
    let affected = 1;
    let root: Pick<BlogThreadItem, 'id'>;
    const requiredAuthorId = Permission.hasGlobalPermission(
      ctx.session,
      'blog.thread.manage'
    )
      ? undefined
      : ctx.session.user.id;
    if (type === 'comment') {
      const comment = await prisma.blogComment.findFirst({
        where: { id, authorId: requiredAuthorId },
        select: { id: true, _count: { select: { replies: true } } },
      });
      if (!comment)
        throw createErrorFromGlobal({
          code: 'NOT_FOUND',
          message: {
            summary: 'Cannot find comment to delete',
            translate: 'responses.blog.comment_not_found',
          },
        });
      const { _count, ...target } = comment;
      affected += _count.replies;
      root = target;
      await prisma.blogComment.delete({ where: { id } });
    } else {
      const reply = await prisma.blogReply.findFirst({
        where: { id, authorId: requiredAuthorId },
        select: { id: true, parentId: true },
      });
      if (!reply)
        throw createErrorFromGlobal({
          code: 'NOT_FOUND',
          message: {
            summary: 'Cannot find reply to delete',
            translate: 'responses.blog.reply_not_found',
          },
        });
      root = reply;
      await prisma.blogReply.delete({ where: { id } });
    }
    return { item: root, affected };
  });