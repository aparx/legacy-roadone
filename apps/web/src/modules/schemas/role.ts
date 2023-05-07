import { z } from 'zod';

/** Enumeration of permission roles */
export const roleSchema = z.enum(['USER', 'MEMBER', 'ADMIN']);

export type Role = z.infer<typeof roleSchema>;

export const defaultRole = 'USER' satisfies Role;
