import { cuidSchema } from '@/utils/schemas/identifierSchema';
import { z } from 'zod';

/** The gig schema used to create a new schema client-side */
export const gigContentSchema = z.object({
  title: z.string().min(3).max(128) /* @unique */,
  country: z.string().max(32).optional().nullish(),
  description: z.string().max(256).optional().nullish(),
  city: z.string().max(32),
  postcode: z.string().max(32),
  street: z.string().max(64),
  start: z.date(),
});

/** The gig schema used to edit an existing Gig on the client-side */
export const gigEditSchema = gigContentSchema.extend(cuidSchema.shape);

/** The complete gig schema, that exists like this in the database. */
export const gigSchema = z
  .object({
    createdAt: z.date() /* @default(now()) */,
    updatedAt: z.date().optional().nullish(),
  })
  .extend(gigContentSchema.shape)
  .extend(cuidSchema.shape);

export const gigProcessedSchema = z
  .object({ htmlDescription: z.string().optional().nullish() })
  .extend(gigSchema.shape);

export type GigContentData = z.infer<typeof gigContentSchema>;

export type GigEditData = z.infer<typeof gigEditSchema>;

export type GigProcessedData = z.infer<typeof gigProcessedSchema>;

export type GigData = z.infer<typeof gigSchema>;
