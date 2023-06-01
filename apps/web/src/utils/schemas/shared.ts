import { $publicUser } from '@/modules/schemas/user';
import { z } from 'zod';

export const $cuidField = z.object({
  id: z.string().cuid(),
});

export const $updatedCreatedAtFields = z.object({
  createdAt: z.date(),
  updatedAt: z.date().nullish().optional(),
});

export type Author = z.infer<typeof $author>;

export const $author = $publicUser.pick({
  id: true,
  name: true,
  image: true,
  verified: true,
  role: true,
});

export const $authorFields = z.object({
  author: $author.nullish().optional(),
  authorId: z.string().cuid(),
});

/** Object that is used as a selection for an author query. */
export const selectAuthorFields = {
  id: true,
  name: true,
  verified: true,
  image: true,
  role: true,
} as const satisfies Record<keyof Author, true>;
