import { $role } from '@/modules/schemas/role';
import { z } from 'zod';

/** Public user schema that contains non-sensitive or publicly required
 * information about a user. */
export const $publicUser = z.object({
  id: z.string().cuid() /* @id */,
  name: z.string().nullish(),
  image: z.string().url().nullish(),
  createdAt: z.date(),
  verified: z.boolean().optional().nullish(),
  role: $role,
});

/** Private user schema that may be redacted when given to third parties */
export const $privateUser = z.object({
  email: z.string() /* @unique */,
});

/** Public user schema extended by `privateUserSchema` (as partial) */
export const $user = $publicUser.extend($privateUser.partial().shape);

export type PublicUser = z.infer<typeof $publicUser>;

export type PrivateUser = z.infer<typeof $privateUser>;

export type UserModel = z.infer<typeof $user>;
