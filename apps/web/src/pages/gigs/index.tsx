import { Page } from '@/components';
import { GigGroup } from '@/modules/gigs/components/GigGroup';
import { Gig } from '@/modules/schemas/gig';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
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
    const map = new Map<number, Gig[]>();
    data?.pages
      .flatMap(({ data }) => data.flat())
      // we sort descending (newest [top] -> oldest [bottom])
      .sort((a, b) => (a.start.getTime() < b.start.getTime() ? 1 : -1))
      .forEach((gig) => {
        const year = gig.start.getFullYear();
        if (!map.has(year)) map.set(year, []);
        map.get(year)!.push(gig);
      });
    return map;
  }, [data]);
  const gigGroupArray = useMemo(() => {
    const groups: ReactNode[] = [];
    for (const year of gigMap.keys()) {
      groups.push(<GigGroup year={year} gigs={gigMap.get(year)!} />);
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
