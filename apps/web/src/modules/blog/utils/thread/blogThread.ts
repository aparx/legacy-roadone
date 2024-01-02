import { BlogThreadItemType } from '@/modules/blog/blog';
import { UnionExtract } from 'shared-utils';
import { z } from 'zod';


/** A thread is *a* group of comments or replies to a comment.
 * The `type` field determines the type of all items within the thread. */
export type BlogThread = (
  | { type: UnionExtract<BlogThreadItemType, 'comment'>; blog: string }
  | { type: UnionExtract<BlogThreadItemType, 'reply'>; parent: string }
) & { blog: string };

export const $blogThread: z.ZodType<BlogThread> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('comment'), blog: z.string() }),
  z.object({
    type: z.literal('reply'),
    parent: z.string(),
    blog: z.string(),
  }),
]);