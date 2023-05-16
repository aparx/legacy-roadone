import { Permission } from '@/modules/auth/utils/permission';
import { Role } from '@/modules/schemas/role';
import { middleware } from '@/server/trpc';
import { Globals } from '@/utils/globals';
import { TRPCError } from '@trpc/server';

/**
 * Allocates a new middleware that throws an error if the user has a role less
 * equivalent to `gte`.
 */
export const createRoleProcedure = (gte: Role, errorMessage?: string) =>
  middleware((opts) => {
    const userRole = Permission.getRoleOfSession(opts.ctx.session);
    if (Permission.isLess(userRole, gte))
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: errorMessage ?? `require role of ${gte} or higher`,
      });
    return opts.next({ ctx: opts.ctx });
  });

export const createPermissiveProcedure = (
  permission: keyof typeof Globals.permissions,
  errorMessage: string = `missing permission ${permission}`
) => createRoleProcedure(Globals.permissions[permission], errorMessage);
