import { Page } from '@/components';
import { RenderableGig } from '@/modules/gigs/components/GigCard/GigCard';
import { GigGroup } from '@/modules/gigs/components/GigGroup';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/globals';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Button, Stack } from 'next-ui';
import { ReactNode, useMemo } from 'react';
import superjson from 'superjson';

export default function GigsPage() {
  // prettier-ignore
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    api.gig.getGigs.useInfiniteQuery({}, {
      trpc: { abortOnUnmount: true },
      staleTime: Infinity,
      getNextPageParam: (lastPage) => lastPage?.nextCursor
    });
  const gigMap = useMemo(() => {
    // Gig to year map
    const map = new Map<number, RenderableGig[]>();
    const now = Date.now();
    let _next: RenderableGig | undefined;
    data?.pages
      .flatMap(({ data }) => data.flat() as RenderableGig[])
      // we sort descending (newest [top] -> oldest [bottom])
      .sort((a, b) => (a.start.getTime() < b.start.getTime() ? 1 : -1))
      .forEach((gig) => {
        const year = gig.start.getFullYear();
        if (!map.has(year)) map.set(year, []);
        map.get(year)!.push(gig);
        if (now - Globals.gigLength >= gig.start.getTime()) {
          gig.state = 'done'; // `gig` is already finished ("done")
        } else if (!_next || gig.start.getTime() < _next?.start?.getTime()) {
          _next = gig; // `gig` is closer to now than previous gigs (time-wise)
        } else gig.state = 'upcoming'; // must be set for re-renders (!)
      });
    if (_next) _next.state = 'next';
    return map;
  }, [data]);
  const gigGroupArray = useMemo(() => {
    const groups: ReactNode[] = [];
    for (const year of gigMap.keys()) {
      groups.push(<GigGroup key={year} year={year} gigs={gigMap.get(year)!} />);
    }
    return groups;
  }, [gigMap]);
  return (
    <Page name={'Auftritte'} pageURL={'gigs'}>
      <Stack direction={'column'} spacing={'md'} hCenter>
        {gigGroupArray as any /* <- why not assignable? */}
      </Stack>
      {hasNextPage && (
        <Button.Text
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more
        </Button.Text>
      )}
    </Page>
  );
}

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: {},
    transformer: superjson,
  });
  await helpers.gig.getGigs.prefetchInfinite({}); // <- same input's important!
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: 15,
  };
}
