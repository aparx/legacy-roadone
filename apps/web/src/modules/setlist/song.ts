import { $cuidField, $updatedCreatedAtFields } from '@/utils/schemas/shared';
import { z } from 'zod';

export const $songContent = z.object({
  name: z.string().min(3).max(64),
  artist: z.string().min(3).max(64),
});

export const $songEdit = $songContent.extend($cuidField.shape);

export const $song = $cuidField
  .extend($songContent.shape)
  .extend($updatedCreatedAtFields.shape);

export type SongContentData = z.infer<typeof $songContent>;

export type SongEditModel = z.infer<typeof $songEdit>;

export type SongModel = z.infer<typeof $song>;
