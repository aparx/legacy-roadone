import { Role } from '@/modules/schemas/role';

export module Globals {
  /** A possible gig's length, after which a Gig is declared `done` */
  export const gigLength = 2.16e7; /* 6h */

  // <======================>
  //  GENERAL CONFIGURATION
  // <======================>

  /** Map of all permissions that require authorization. */
  export const permissions = {
    /** Permission to be able to add new events (gigs) */
    postEvents: 'MEMBER',
    /** Permission to be able to edit already existing events (gigs) */
    editEvents: 'MEMBER',
    /** Permission to be able to delete existing events (gigs) */
    deleteEvents: 'ADMIN',
  } as const satisfies Record<string, Role>;

  /** Intervals (in seconds) for incremental static regeneration per page. */
  export const isrIntervals = {
    gigs: 15,
  } as const satisfies Record<string, number>;
}
