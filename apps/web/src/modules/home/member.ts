import { $cuidField } from '@/utils/schemas/shared';
import { z } from 'zod';

export type MemberContent = z.infer<typeof $member>;

export const $memberContent = z.object({
  firstName: z.string().max(32),
  lastName: z.string().max(32),
  role: z.string().max(32),
  /** The image path relative to the S3 storage bucket URL */
  image: z.string().optional().nullish(),
  biography: z.string().max(256).optional().nullish(),
});

export type MemberModel = z.infer<typeof $member>;

export const $member = $memberContent.extend($cuidField.shape);
