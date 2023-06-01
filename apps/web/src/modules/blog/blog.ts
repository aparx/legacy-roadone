import {
  $authorFields,
  $cuidField,
  $updatedCreatedAtFields,
} from '@/utils/schemas/shared';
import { UnionExtract } from 'shared-utils';
import { z } from 'zod';

// <================================================>
//                  BLOG POST SCHEMAS
// <================================================>

/** Union of all item types (comment and reply) distinguishing between top-level
 *  comments (named 'comments') and replies nested under these. */
export type BlogThreadItemType = z.infer<typeof $blogThreadItemType>;

export const $blogThreadItemType = z.union([
  z.literal('comment'),
  z.literal('reply'),
]);

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
export type BlogThreadShared = z.infer<typeof $blogThreadShared>;

export const $blogThreadShared = $cuidField
  .extend($blogThreadContent.shape)
  .extend($updatedCreatedAtFields.shape)
  .extend($authorFields.shape)
  .extend({
    blog: $blogPost.optional(),
    blogId: z.string(),
  });

/** Top-level comment, having children (replies) of schema `blogReply`. */
export type BlogCommentModel = BlogThreadShared & {
  replies?: BlogReplyModel[] | undefined;
  replyCount?: number;
};

export const $blogComment: z.ZodType<BlogCommentModel> =
  $blogThreadShared.extend({
    replies: z.lazy(() => $blogReply.array().optional()),
    replyCount: z.number().optional(),
  });

/** Nested comments (depth: 1) right beneath (top-level) comments. */
export type BlogReplyModel = BlogThreadShared & {
  parent?: BlogCommentModel | undefined;
  parentId: string;
};

export const $blogReply: z.ZodType<BlogReplyModel> = $blogThreadShared.extend({
  parent: $blogComment.optional(),
  parentId: z.string(),
});

/** General blog thread item, combining `comment` and `reply` for easier usage,
 *  discriminating the two types via a `type` property. */
export type BlogThreadItem =
  | ({ type: UnionExtract<BlogThreadItemType, 'comment'> } & BlogCommentModel)
  | ({ type: UnionExtract<BlogThreadItemType, 'reply'> } & BlogReplyModel);

// prettier-ignore
export const $blogThreadItem: z.ZodType<BlogThreadItem> =
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('comment') }).extend({
      replies: $blogReply.array().optional(),
      replyCount: z.number().optional(),
    }).extend($blogThreadShared.shape),
    z.object({ type: z.literal('reply') }).extend({
      parent: $blogComment.optional(),
      parentId: z.string(),
    }).extend($blogThreadShared.shape),
]);
