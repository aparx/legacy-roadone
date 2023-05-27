import {
  blogReplyContentSchema,
  BlogReplyData,
  blogReplyParented,
} from '@/modules/blogs/blogReply';
import { ServerGlobals } from '@/server/globals';
import {
  createPermissiveMiddleware,
  rateLimitingMiddleware,
  shallowSanitizationMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure } from '@/server/trpc';
import { createErrorFromGlobal } from '@/utils/error';
import { Globals } from '@/utils/global/globals';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const addReply = procedure
  .input(blogReplyParented.extend(blogReplyContentSchema.shape))
  .use(createPermissiveMiddleware('blog.comment.post'))
  .use(rateLimitingMiddleware)
  .use(shallowSanitizationMiddleware)
  .mutation(async ({ input, ctx }): Promise<BlogReplyData> => {
    if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const { blogId, parentId, content } = input;
    const blog = await prisma.blogPost.findUnique({
      where: { id: blogId },
      select: { id: true, repliesDisabled: true, totalReplyCount: true },
    });
    if (!blog)
      throw createErrorFromGlobal({
        code: 'NOT_FOUND',
        message: {
          summary: 'Blog cannot be found',
          translate: 'responses.blog.reply.add_error_notfound',
        },
      });
    if (blog.repliesDisabled)
      throw createErrorFromGlobal({
        code: 'FORBIDDEN',
        message: {
          summary: 'Replies are disabled',
          translate: 'responses.blog.reply.add_error_disabled',
        },
      });
    if (blog.totalReplyCount > ServerGlobals.Blog.maxTotalReplyCount)
      throw createErrorFromGlobal({
        code: 'FORBIDDEN',
        message: {
          summary: 'Maximum amount of replies reached',
          translate: 'responses.blog.reply.error_too_many',
        },
      });

    // Before the `depth` property, the entire depth-tree was queried, which may
    // have resulted in issues in the future. To further future-proof, we include a
    // `depth` in the data for now.
    let depth = 1;
    if (parentId) {
      const parent = await prisma.blogReply.findFirst({
        where: { blogId, id: parentId },
        select: { id: true, depth: true },
      });
      if (!parent && parentId)
        throw createErrorFromGlobal({
          code: 'NOT_FOUND',
          message: {
            summary: 'Parent not found',
            translate: 'responses.blog.reply.add_error_notfound',
          },
        });
      depth = parent?.depth ? 1 + parent.depth : 1;
      if (depth > Globals.maxReplyDepth)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Reply depth exceeded (${depth} on ${parentId})`,
        });
    }

    // Check if the user already has a reply in the current depth.
    // Due to the unique index of `parentId`, `blogId` and `authorId` we only need to
    // check on the root level depth, due to `parentId` being nullable.
    if (!parentId) {
      const session = ctx.session.user;
      const selfReply = await prisma.blogReply.findFirst({
        where: { blogId, authorId: session.id, parentId: null },
        select: { id: true },
      });
      if (selfReply)
        throw createErrorFromGlobal({
          code: 'FORBIDDEN',
          message: {
            summary: 'Already replied',
            translate: 'responses.blog.reply.already_replied',
          },
        });
    }

    const seq: any[] = [
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
      seq.push(
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
      seq.push(
        prisma.blogPost.update({
          where: { id: blogId },
          data: {
            replyCount: { increment: 1 },
            totalReplyCount: { increment: 1 },
          },
        })
      );
    }
    return (
      await prisma.$transaction(seq).catch((error) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' /* unique constraint failed */
        ) {
          throw createErrorFromGlobal({
            code: 'FORBIDDEN',
            message: {
              summary: 'Already replied',
              translate: 'responses.blog.reply.already_replied',
            },
          });
        }
        throw error;
      })
    )[0] as BlogReplyData;
  });
