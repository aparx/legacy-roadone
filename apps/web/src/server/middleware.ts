import { Permission } from '@/modules/auth/utils/permission';
import { Role } from '@/modules/schemas/role';
import { middleware } from '@/server/trpc';
import { Globals } from '@/utils/global/globals';
import { TRPCError } from '@trpc/server';
import * as sanitizeHtml from 'sanitize-html';

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
  errorMessage: string = `missing permission '${permission}'`
) => createRoleProcedure(Globals.permissions[permission], errorMessage);

/** Middleware that sanitizes every string value of the input object (optional).
 * Note: this procedure is `not` deep! It's just a "shallow" sanitization! */
export const fullSanitizationProcedure = middleware((opts) => {
  if (opts.input && typeof opts.input === 'object') {
    Object.keys(opts.input as object)
      .filter((k) => typeof opts.input![k] === 'string')
      .forEach((k) => (opts.input![k] = sanitizeHtml(opts.input![k])));
  }
  return opts.next({ ctx: opts.ctx });
});
