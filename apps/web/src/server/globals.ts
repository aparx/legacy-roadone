import { Role } from '@/modules/schemas/role';

export module ServerGlobals {
  export module Blog {
    /** The maximum *total* amount of replies that can exist for a blog post. */
    export const maxTotalReplyCount = 250;
  }

  export module RateLimitation {
    /** What role (and higher) is immune to rate-limitation. */
    export const immunity = 'ADMIN' satisfies Role;

    /** The timeframe in which `x` (`consecutiveRequests`) amount of requests must
     *  be sent, in order for the authenticated user to be rate-limited. */
    export const timeframe = 750; /* .75s */

    /** The (exclusive) amount of requests within `timeframe` that lead to
     *  rate-limitation. The below number must be between 0 and 65534. */
    export const consecutiveRequests = 4;

    /** Defines the amount of milliseconds for each elapsed since the last sent
     * request will decrement the internal `actionCount` of a user by 1 (one). */
    export const countDecrementInterval = timeframe; /* .75s */
  }
}
