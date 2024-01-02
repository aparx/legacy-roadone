import { Role } from '@/modules/schemas/role';

export module ServerGlobals {
  /** What role (and higher) is immune to rate-limitation. */
  export const rateLimitImmunity = 'ADMIN' satisfies Role;
}