import { publicUserSchema } from '@/modules/schemas/user';
import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { z } from 'zod';

// <===================================>
//       BLOG REPLY SCHEMA TYPES
// <===================================>

export const blogReplyContentSchema = z.object({
  content: z.string().min(2).max(150),
});

export const blogReplySchema = blogReplyContentSchema
  .extend(cuidSchema.shape)
  .extend({
    blogId: z.string().cuid(),
    parentId: z.string().nullish().optional(),
    authorId: z.string(),
    author: publicUserSchema.nullish(),
    replyCount: z.number(),
    createdAt: z.date(),
    updatedAt: z.date().nullish().optional(),
  });

export type BlogReplyContentData = z.infer<typeof blogReplyContentSchema>;

export type BlogReplyData = z.infer<typeof blogReplySchema>;
