import { z } from 'zod';

export const infiniteQueryInput = z.object({
  cursor: z.number().int().default(0),
  limit: z.number().max(50).default(30),
});

export type InfiniteQueryInput = z.infer<typeof infiniteQueryInput>;
