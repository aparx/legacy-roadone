import { z } from 'zod';

export const gigIdSchema = z.object({ id: z.string().cuid() });

/** The gig schema used to create a new schema client-side */
export const inputGigSchema = z.object({
  title: z.string().min(3).max(128) /* @unique */,
  country: z.string().max(32).optional().nullish(),
  description: z.string().max(256).optional().nullish(),
  city: z.string().max(32),
  postcode: z.string().max(32),
  street: z.string().max(64),
  start: z.date(),
});

/** The gig schema used to edit an existing Gig on the client-side */
export const editGigSchema = inputGigSchema.extend(gigIdSchema.shape);

/** The complete gig schema, that exists like this in the database. */
export const gigSchema = z
  .object({
    createdAt: z.date() /* @default(now()) */,
    updatedAt: z.date().optional().nullish(),
  })
  .extend(inputGigSchema.shape)
  .extend(gigIdSchema.shape);

export const processedGigSchema = gigSchema.extend(
  z.object({
    htmlDescription: z.string().optional().nullish(),
  }).shape
);

export type InputGig = z.infer<typeof inputGigSchema>;

export type EditGig = z.infer<typeof editGigSchema>;

export type GigEvent = z.infer<typeof gigSchema>;

export type ProcessedGig = z.infer<typeof processedGigSchema>;
