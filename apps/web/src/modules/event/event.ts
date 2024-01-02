import { $cuidField } from '@/utils/schemas/shared';
import { z } from 'zod';

export const $eventType = z.enum(['BLOG', 'GIG', 'SONG'] as const);

export type EventModelType = z.infer<typeof $eventType>;

export const $event = z
  .object({
    refId: z.string(),
    type: $eventType,
    title: z.string(),
    content: z.string(),
    updatedAt: z.date(),
  })
  .extend($cuidField.shape);

export type EventModel = z.infer<typeof $event>;