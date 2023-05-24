import { Permission } from '@/modules/auth/utils/permission';
import { Role } from '@/modules/schemas/role';
import { ServerGlobals } from '@/server/globals';
import { prisma } from '@/server/prisma';
import { middleware } from '@/server/trpc';
import { Globals } from '@/utils/global/globals';
import { TRPCError } from '@trpc/server';
import * as sanitizeHtml from 'sanitize-html';

/**
 * Allocates a new middleware that throws an error if the user has a role less
 * equivalent to `gte`.
 */
export const createRoleMiddleware = (gte: Role, errorMessage?: string) =>
  middleware((opts) => {
    const userRole = Permission.getRoleOfSession(opts.ctx.session);
    if (!opts.ctx.session || Permission.isLess(userRole, gte))
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: errorMessage ?? `require role of ${gte} or higher`,
      });
    return opts.next({ ctx: opts.ctx });
  });

export const createPermissiveMiddleware = (
  permission: keyof typeof Globals.permissions,
  errorMessage: string = `missing permission '${permission}'`
) => createRoleMiddleware(Globals.permissions[permission], errorMessage);

/** Middleware that sanitizes every string value of the input object (optional).
 * Note: this procedure is `not` deep! It's just a "shallow" sanitization! */
export const shallowSanitizationMiddleware = middleware((opts) => {
  if (opts.input && typeof opts.input === 'object') sanitizeObject(opts.input);
  return opts.next({ ctx: opts.ctx });
});

/**
 * Sanitizes every field (shallow) within `object` in-place, by mutating each field
 * whose value is typeof `string`. This operation mutates `object`. Thus, the returned
 * value is equivalent to `object`.
 *
 * @param object the object to sanitize shallowly
 * @return the sanitized object (so simply `object`)
 */
export function sanitizeObject<T extends object>(object: T): T {
  Object.keys(object as object)
    .filter((k) => typeof object![k] === 'string')
    .forEach((k) => (object![k] = sanitizeHtml(object![k])));
  return object;
}

/**
 * Middleware that implements rate limitation using `ServerGlobals.RateLimitation` as
 * the primary configuration source, that provides all necessary (global) options.
 * This middleware might end up mutating or querying the database, which is why this
 * middleware shouldn't be used too frequently and only for mutations.
 */
export const rateLimitingMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.session) return next({ ctx });
  const role = Permission.getRoleOfSession(ctx.session);
  if (Permission.isGreaterOrEqual(role, ServerGlobals.RateLimitation.immunity))
    return next({ ctx });
  let { lastAction, actionCount, id } = ctx.session.user;
  actionCount ??= 0;
  const actionDelta = lastAction && Date.now() - lastAction.getTime();
  if (actionDelta && actionDelta <= ServerGlobals.RateLimitation.timeframe) {
    if (actionCount > ServerGlobals.RateLimitation.consecutiveRequests)
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
    await prisma.user.update({
      where: { id },
      data: {
        lastAction: new Date(),
        actionCount: { increment: 1 },
      },
    });
  } else {
    const subtrahend = actionDelta
      ? actionDelta / ServerGlobals.RateLimitation.countDecrementInterval
      : 1;
    await prisma.user.update({
      where: { id },
      data: {
        lastAction: new Date(),
        // This is a non-atomic operation and might lead to issues in the future (?)
        actionCount: Math.max(Math.round(actionCount - subtrahend), 0),
      },
    });
  }
  return next({ ctx });
});
