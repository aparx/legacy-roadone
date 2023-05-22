import { blogPostSchema } from '@/modules/blogs/blogPost';
import { z } from 'zod';

export const blogCommentPathSchema = z.array(z.string().cuid());

export const blogCommentGroupBase = z.object({
  root: blogPostSchema,
  path: blogCommentPathSchema,
});

/** A group node is a group of comments nested underneath another node or the article. */
export type CommentGroupNode = z.infer<typeof blogCommentGroupBase> & {
  /** Parent <i>group</i>; cannot be equal to `root` */
  parent?: CommentGroupNode | undefined | null;
};

export const blogCommentGroupSchema = blogCommentGroupBase.extend({
  parent: z.lazy(() => blogCommentGroupSchema.nullish()),
}) as z.ZodType<CommentGroupNode>;

export type CommentGroupPath = z.infer<typeof blogCommentPathSchema>;
