import { $cuidField } from '@/utils/schemas/shared';
import { z } from 'zod';


/** The gig schema used to create a new schema client-side */
export const $gigContent = z.object({
  title: z.string().min(3).max(128) /* @unique */,
  country: z.string().max(32),
  description: z.string().max(256).optional().nullish(),
  city: z.string().max(32),
  postcode: z.string().max(32),
  street: z.string().max(64),
  start: z.date(),
});

/** The gig schema used to edit an existing Gig on the client-side */
export const $gigEdit = $gigContent.extend($cuidField.shape);

/** The complete gig schema, that exists like this in the database. */
export const $gig = z
  .object({
    createdAt: z.date() /* @default(now()) */,
    updatedAt: z.date().optional().nullish(),
  })
  .extend($gigContent.shape)
  .extend($cuidField.shape);

export const $gigProcessed = z
  .object({ htmlDescription: z.string().optional().nullish() })
  .extend($gig.shape);

export type GigContentData = z.infer<typeof $gigContent>;

export type GigEditData = z.infer<typeof $gigEdit>;

export type ProcessedGigModel = z.infer<typeof $gigProcessed>;

export type GigModel = z.infer<typeof $gig>;