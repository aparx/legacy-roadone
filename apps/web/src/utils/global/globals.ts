import { Role } from '@/modules/schemas/role';

export module Globals {
  /** A possible gig's length, after which a Gig is declared `done` */
  export const gigLength = 2.16e7; /* 6h */

  /** Locale of the entire site */
  export const siteLocale = 'de_DE';
  /** Locale of time translations */
  export const timeLocale = siteLocale.replace('_', '-');

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

    postBlogs: 'ADMIN',
    editBlogs: 'ADMIN',
    deleteBlogs: 'ADMIN',
  } as const satisfies Record<string, Role>;

  /** Intervals (in seconds) for incremental static regeneration per page. */
  export const isrIntervals = {
    gigs: 60 * 60 * 6 /* 6h; due to on-demand revalidation */,
    blogs: 60 * 60 * 6 /* 6h; due to on-demand revalidation */,
  } as const satisfies Record<string, number>;
}
