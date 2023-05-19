import { publicUserSchema } from '@/modules/schemas/user';
import { z } from 'zod';

export const blogIdSchema = z.object({ id: z.string().cuid() });

/** The base blog content schema, representing the editable content. */
export const blogContentSchema = z.object({
  title: z.string().min(3).max(64),
  content: z.string().max(4046),
});

/** The base blog schema, as found in the database. */
export const blogSchema = z
  .object({
    commentCount: z.number().default(0),
    authorId: z.string().cuid(),
    author: publicUserSchema.nullish(),
    createdAt: z.date(),
    updatedAt: z.date().nullish().optional(),
  })
  .extend(blogContentSchema.shape)
  .extend(blogIdSchema.shape);

export const blogProcessedSchema = z
  .object({
    htmlContent: z.string().nullish(),
  })
  .extend(blogSchema.shape);

export const blogEditSchema = blogContentSchema.extend(blogIdSchema.shape);

export type BlogEditData = z.infer<typeof blogEditSchema>;

export type BlogContentData = z.infer<typeof blogContentSchema>;

export type BlogProcessedData = z.infer<typeof blogProcessedSchema>;

export type BlogData = z.infer<typeof blogSchema>;
