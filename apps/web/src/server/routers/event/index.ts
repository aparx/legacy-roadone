import { EventModel } from '@/modules/event/event';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import {
  createInfiniteQueryInput,
  createInfiniteQueryResult,
  GetInfiniteQueryResult,
} from '@/utils/schemas/infiniteQuery';

export type GetEventsOutput = GetInfiniteQueryResult<EventModel>;

export const eventRouter = router({
  get: procedure
    .input(createInfiniteQueryInput(2, 2))
    .query(async ({ input }): Promise<GetEventsOutput> => {
      return createInfiniteQueryResult(input, {
        infiniteData: await prisma.event.findMany({
          orderBy: { updatedAt: 'desc' },
          skip: input.cursor,
          take: input.limit,
        }),
      });
    }),
});
