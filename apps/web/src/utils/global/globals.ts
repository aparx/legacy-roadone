import { Role } from '@/modules/schemas/role';

export module Globals {
  /** A possible gig's length, after which a Gig is declared `done` */
  export const gigLength = 2.16e7; /* 6h */

  /** Locale of the entire site */
  export const siteLocale = 'de_DE';
  /** Locale of time translations */
  export const timeLocale = siteLocale.replace('_', '-');

  // <======================>
  //    BLOG CONFIGURATION
  // <======================>

  /** The maximum amount of replies a user can send (inclusive) */
  export const maxPersonalBlogReplies = 5;

  /** Total amount of blog replies and comments a blog can have (inclusive) */
  export const maxTotalBlogComments = 250;

  /** The limit of possible comments to fetch (and also the default!) */
  export const commentFetchPageLimit = 3;

  // <======================>
  //  GENERAL CONFIGURATION
  // <======================>

  /** Map of all permissions that require authorization. */
  export const permissions = {
    /** Permission to be able to add new events (gigs) */
    'gig.post': 'MEMBER',
    /** Permission to be able to edit already existing events (gigs) */
    'gig.edit': 'MEMBER',
    /** Permission to be able to delete existing events (gigs) */
    'gig.delete': 'ADMIN',

    'blog.post': 'ADMIN',
    'blog.edit': 'ADMIN',
    'blog.delete': 'ADMIN',

    'blog.thread.post': 'USER',
    'blog.thread.delete': 'USER',
    /** Permission to manage all comments and replies (owning) */
    'blog.thread.manage': 'ADMIN',
  } as const satisfies Record<string, Role>;

  /** Intervals (in seconds) for incremental static regeneration per page. */
  export const isrIntervals = {
    gigs: 60 * 60 * 6 /* 6h; due to on-demand revalidation */,
    blogs: 60 * 60 * 6 /* 6h; due to on-demand revalidation */,
  } as const satisfies Record<string, number>;

  /** Stale times (in milliseconds) for Tanstack-Query caching purposes */
  export const staleTimes = {
    blogs: 60 * 60 * 1000 /* 1h */,
    replies: 5 * 60 * 1000 /* 5m */,
  } as const satisfies Record<string, number | undefined>;
}
