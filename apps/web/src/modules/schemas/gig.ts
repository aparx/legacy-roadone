import { z } from 'zod';

/** The gig schema used to create a new schema client-side */
export const inputGigSchema = z.object({
  title: z.string().min(3).max(128) /* @unique */,
  country: z.string().max(32).optional().nullish(),
  description: z.string().max(64).optional().nullish(),
  city: z.string().max(32),
  postcode: z.string().max(32),
  street: z.string().max(64),
  start: z.date(),
});

/** The complete gig schema, that exists like this in the database. */
export const gigSchema = z
  .object({
    id: z.string().cuid() /* @id */,
    createdAt: z.date() /* @default(now()) */,
    updatedAt: z.date().optional().nullish(),
  })
  .extend(inputGigSchema.shape);

export type InputGig = z.infer<typeof inputGigSchema>;

export type Gig = z.infer<typeof gigSchema>;
