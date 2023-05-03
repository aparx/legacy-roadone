import { roleSchema } from '@/modules/schemas/role';
import { z } from 'zod';

/** Public user schema that contains non-sensitive or publicly required
 * information about a user. */
export const publicUserSchema = z.object({
  id: z.string().cuid() /* @id */,
  name: z.string().nullish(),
  image: z.string().url().nullish(),
  createdAt: z.date(),
  role: roleSchema,
});

/** Private user schema that may be redacted when given to third parties */
export const privateUserSchema = z.object({
  email: z.string() /* @unique */,
});

/** Public user schema extended by `privateUserSchema` (as partial) */
export const userSchema = publicUserSchema.extend(
  privateUserSchema.partial().shape
);

export type PublicUserSchema = z.infer<typeof publicUserSchema>;

export type PrivateUserSchema = z.infer<typeof privateUserSchema>;

export type UserSchema = z.infer<typeof userSchema>;
