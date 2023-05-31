import {
  $authorFields,
  $cuidField,
  $updatedCreatedAtFields,
} from '@/utils/schemas/sharedSchemas';
import { PickAndReplace } from 'shared-utils';
import { z } from 'zod';

// <================================================>
//                  BLOG POST SCHEMAS
// <================================================>

/** Basic data representing the pure content of blog posts. */
export type BlogPostContentData = z.infer<typeof $blogPostContent>;

export const $blogPostContent = z.object({
  title: z.string().min(3).max(64),
  content: z.string().min(3).max(1024),
  commentsDisabled: z.boolean().optional(),
});

/** Data being the pure content of a blog thread item (comment or reply). */
export type BlogThreadContentData = z.infer<typeof $blogThreadContent>;

export const $blogThreadContent = z.object({
  content: z.string().min(2).max(250),
});

/** Data required to edit a blog post. */
export type BlogPostEditData = z.infer<typeof $blogPostEdit>;

export const $blogPostEdit = $cuidField.extend($blogPostContent.shape);

/** Blog post model like the database schema. */
export type BlogPostModel = z.infer<typeof $blogPost>;

export const $blogPost = $cuidField
  .extend($blogPostContent.shape)
  .extend($updatedCreatedAtFields.shape)
  .extend($authorFields.shape);

export type ProcessedBlogPostModel = z.infer<typeof $blogPostProcessed>;

export const $blogPostProcessed = $blogPost.extend({
  htmlContent: z.string(),
  /** Top-level comment & deep reply counts summed up */
  totalCommentCount: z.number(),
  /** Top-level comment count */
  commentCount: z.number().optional(),
});

// <================================================>
//           BLOG POST THREAD-ITEM SCHEMAS
// <================================================>

/** Type that defines shared properties between comments and replies. */
export type BlogPostThreadShared = z.infer<typeof $blogThreadShared>;

export const $blogThreadShared = $cuidField
  .extend($blogThreadContent.shape)
  .extend($updatedCreatedAtFields.shape)
  .extend($authorFields.shape)
  .extend({
    blog: $blogPost,
    blogId: z.string(),
  });

/** General blog thread item, combining `comment` and `reply` for easier usage. */
export type BlogThreadItem = BlogPostThreadShared & {
  parent?: BlogThreadItem | undefined | null;
  parentId?: string | undefined | null;
  replies?: BlogThreadItem[] | undefined;
  replyCount?: number;
};

export const $blogThreadItem: z.ZodType<BlogThreadItem> =
  $blogThreadShared.extend({
    // Always optional on this item, since it can represent top-level too
    parent: z.lazy(() => $blogThreadItem.nullish().optional()),
    parentId: z.string().nullish().optional(),
    replies: z.lazy(() => $blogThreadItem.array().optional()),
    replyCount: z.number().optional(),
  });

/** Top-level comment, having children (replies) of schema `blogReply`. */
export type BlogCommentModel = BlogPostThreadShared &
  PickAndReplace<BlogThreadItem, 'replies', BlogReplyModel[]> &
  Pick<BlogThreadItem, 'replyCount'>;

export const $blogComment: z.ZodType<BlogCommentModel> =
  $blogThreadShared.extend({
    replies: z.lazy(() => $blogReply.array()),
    replyCount: z.number().optional(),
  });

/** Nested comments (depth: 1) right beneath (top-level) comments. */
export type BlogReplyModel = BlogPostThreadShared &
  PickAndReplace<BlogThreadItem, 'parent', BlogCommentModel> &
  Required<Pick<BlogThreadItem, 'parentId'>>;

export const $blogReply: z.ZodType<BlogReplyModel> = $blogThreadShared.extend({
  parent: $blogComment,
  parentId: z.string(),
});
