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

  /** Maximum amount of reply-depth (exclusive; must be between 1 and 10) */
  export const maxReplyDepth = 4;

  export const replyFetchLimit = 3;

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

    'blog.comment.post': 'USER',
    /** Permission that allows the target user to manipulate every reply. */
    'blog.reply.ownAll': 'ADMIN',
  } as const satisfies Record<string, Role>;

  /** Intervals (in seconds) for incremental static regeneration per page. */
  export const isrIntervals = {
    gigs: 60 * 60 * 6 /* 6h; due to on-demand revalidation */,
    blogs: 60 * 60 * 6 /* 6h; due to on-demand revalidation */,
  } as const satisfies Record<string, number>;
}
