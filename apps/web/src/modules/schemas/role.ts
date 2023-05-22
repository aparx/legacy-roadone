import { z } from 'zod';

/** Order(!): from lowest permission-level to highest */
export const roleArray = ['GUEST', 'USER', 'MEMBER', 'ADMIN'] as const;

/** Enumeration of permission roles */
export const roleSchema = z.enum(roleArray);

export type Role = z.infer<typeof roleSchema>;

export const defaultRole = 'GUEST' satisfies Role;
