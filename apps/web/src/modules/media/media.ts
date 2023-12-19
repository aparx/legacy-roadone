import { $cuidField, $updatedCreatedAtFields } from '@/utils/schemas/shared';
import { z } from 'zod';

// <====> Media Group <====>

export type MediaGroupContentData = z.infer<typeof $mediaGroupContent>;

export const $mediaGroupContent = z.object({
  title: z.string().max(255),
  description: z.string().max(2048),
  pinned: z.boolean(),
});

export type MediaGroupModel = z.infer<typeof $mediaGroup>;

export const $mediaGroup = $cuidField
  .extend($updatedCreatedAtFields.shape)
  .extend($mediaGroupContent.shape)
  .extend({ items: z.lazy(() => $mediaItem.array()) });

export type ProcessedMediaGroupModel = z.infer<typeof $mediaGroupProcessed>;

export const $mediaGroupProcessed = $mediaGroup.extend({
  /** Total amount of items for current type */
  typeItemCount: z.number().nullish(),
});

export type MediaGroupEditData = z.infer<typeof $mediaGroupEdit>;

export const $mediaGroupEdit = $mediaGroupContent.extend($cuidField.shape);

// <====> Media Item <====>

export type MediaItemType = z.infer<typeof $mediaItemType>;

export const mediaItemTypeArray = ['IMAGE', 'VIDEO', 'AUDIO'] as const;

export const $mediaItemType = z.enum(mediaItemTypeArray);

export type MediaItemContentData = z.infer<typeof $mediaItemContent>;

export const $mediaItemContent = z.object({
  name: z.string().max(255).optional().nullish(),
  type: $mediaItemType,
  url: z.string().url().min(3).max(800).optional().nullish(),
  groupId: z.string(),
});

export type MediaURLItemContentData = z.infer<typeof $mediaUrlItemContent>;

export const $mediaUrlItemContent = $mediaItemContent.required({ url: true });

export type MediaItemModel = z.infer<typeof $mediaItem>;

export const $mediaItem = $cuidField
  .extend($updatedCreatedAtFields.shape)
  .extend($mediaItemContent.shape)
  .extend({
    mimetype: z.string().max(255).optional().nullish(),
    group: $mediaGroup.nullish().optional(),
  });

export type ProcessedMediaItemModel = z.infer<typeof $processedMediaItem>;

export const $processedMediaItem = $mediaItem.omit({ url: true }).extend({
  /** URL is either an external URL or the S3 public-URL to the object. */
  publicURL: z.string(),
});
