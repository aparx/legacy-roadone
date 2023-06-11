import { Permission } from '@/modules/auth/utils/permission';
import { Role } from '@/modules/schemas/role';
import { ServerGlobals } from '@/server/globals';
import { middleware } from '@/server/trpc';
import { rateLimiter, RateLimitOptions } from '@/server/utils/rateLimiter';
import { createErrorFromGlobal } from '@/utils/error';
import { Globals } from '@/utils/global/globals';
import { TRPCError } from '@trpc/server';
import requestIp from 'request-ip';
import * as sanitizeHtml from 'sanitize-html';

/**
 * Allocates a new middleware that throws an error if the user has a role less
 * equivalent to `gte`.
 */
export function createRoleMiddleware(gte: Role, errorMessage?: string) {
  return middleware((opts) => {
    const userRole = Permission.getRoleOfSession(opts.ctx.session);
    if (!opts.ctx.session || Permission.isLess(userRole, gte))
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: errorMessage ?? `require role of ${gte} or higher`,
      });
    return opts.next({ ctx: opts.ctx });
  });
}

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
function sanitizeObject<T extends object>(object: T): T {
  Object.keys(object)
    .filter((k) => typeof object[k] === 'string')
    .forEach((k) => (object[k] = sanitizeHtml(object[k])));
  return object;
}

/**
 * Returns a middleware function factory, that when executed uses LRU-cache to store rate
 * limitations. The returning function takes in `limit` which represents the amount of
 * requests allowed for the in the `options` declared configurations.
 *
 * @param options the options for rate limitations.
 */
export function createRateLimiterMiddlewareFactory(options?: RateLimitOptions) {
  const limiter = rateLimiter(options);
  return (limit: number = 20) =>
    middleware(async ({ ctx, next }) => {
      if (!ctx.req)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Context request missing',
        });
      const role = Permission.getRoleOfSession(ctx.session);
      if (Permission.isGreaterOrEqual(role, ServerGlobals.rateLimitImmunity))
        return next({ ctx });
      const token = ctx.session?.user?.id || requestIp.getClientIp(ctx.req!);
      if (!token || !ctx.res) throw new TRPCError({ code: 'BAD_REQUEST' });
      await limiter.check(ctx.res, limit, token).catch((err) => {
        throw createErrorFromGlobal({
          code: 'TOO_MANY_REQUESTS',
          message: {
            summary: 'Too many requests within a small time window',
            translate: 'general.too_many_requests',
          },
          cause: err,
        });
      });
      return next({ ctx });
    });
}

/**
 * One shared rate limiter, using the same cache. This means, that one endpoint using
 * this (named 'a') has an effect on the other endpoint using this (named 'b').
 */
export const sharedRateLimiterMiddlewareFactory =
  createRateLimiterMiddlewareFactory();

/**
 * One shared rate limiter with one middleware instance, having a default limit of `20`.
 * This means that 20 requests per minute per token are allowed.
 *
 * Should be used with caution, since queries should be available to all roles most of
 * the time and should not be rate limited or if, then with a separate cache.
 *
 * @see sharedRateLimiterMiddlewareFactory
 */
export const sharedRateLimitingMiddleware =
  sharedRateLimiterMiddlewareFactory();
