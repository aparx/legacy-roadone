import { publicUserSchema } from '@/modules/schemas/user';
import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { z } from 'zod';

// <===================================>
//        BLOG POST SCHEMA TYPES
// <===================================>

/** The base blog content schema, representing the editable content. */
export const blogPostContentSchema = z.object({
  title: z.string().min(3).max(64),
  content: z.string().max(4046),
  repliesDisabled: z.boolean(),
});

/** The base blog schema, as found in the database. */
export const blogPostSchema = z
  .object({
    totalReplyCount: z.number().default(0),
    replyCount: z.number().default(0),
    authorId: z.string().cuid(),
    author: publicUserSchema.nullish(),
    createdAt: z.date(),
    updatedAt: z.date().nullish().optional(),
  })
  .extend(blogPostContentSchema.shape)
  .extend(cuidSchema.shape);

export const blogPostProcessedSchema = z
  .object({ htmlContent: z.string().nullish() })
  .extend(blogPostSchema.shape);

export const blogPostEditSchema = blogPostContentSchema.extend(
  cuidSchema.shape
);

export type BlogPostEditData = z.infer<typeof blogPostEditSchema>;

export type BlogPostContentData = z.infer<typeof blogPostContentSchema>;

export type BlogPostProcessedData = z.infer<typeof blogPostProcessedSchema>;

export type BlogPostData = z.infer<typeof blogPostSchema>;
