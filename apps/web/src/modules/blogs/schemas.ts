import { blogSchema } from '@/modules/schemas/blog';
import { z } from 'zod';

export const blogCommentPathSchema = z.array(z.string().cuid());

export const blogCommentGroupBase = z.object({
  root: blogSchema,
  path: blogCommentPathSchema,
});

/** A group node is a group of comments nested underneath another node or the article. */
export type BlogCommentGroup = z.infer<typeof blogCommentGroupBase> & {
  /** Parent <i>group</i>; cannot be equal to `root` */
  parent: BlogCommentGroup | undefined | null;
};

const blogCommentGroupSchema = blogCommentGroupBase.extend({
  parent: z.lazy(() => blogCommentGroupSchema.nullish()),
}) as z.ZodType<BlogCommentGroup>;

export type BlogCommentPath = z.infer<typeof blogCommentPathSchema>;
