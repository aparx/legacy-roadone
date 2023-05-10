import { DialogConfig, Page } from '@/components';
import { Permission } from '@/modules/auth/utils/permission';
import { RenderableGig } from '@/modules/gigs/components/GigCard/GigCard';
import { GigGroup } from '@/modules/gigs/components/GigGroup';
import { apiRouter } from '@/server/routers/_api';
import { useDialogHandle } from '@/stores/components/dialogHandle';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Button, Stack } from 'next-ui';
import { ReactNode, useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { MdAdd } from 'react-icons/md';
import superjson from 'superjson';
import { BreakpointName } from 'theme-core';
import { z } from 'zod';

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  await helpers.gig.getGigs.prefetchInfinite({}); // <- same input's important!
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.gigs,
  };
}

const gigsWidth = 'md' satisfies BreakpointName;

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
          gig.state = 'upcoming';
          _next = gig; // `gig` is closer to now than previous gigs (time-wise)
        } else gig.state = 'upcoming';
      });
    if (_next) _next.state = 'next';
    return map;
  }, [data]);
  const gigGroupArray = useMemo(() => {
    const groups: ReactNode[] = [];
    for (const year of gigMap.keys()) {
      groups.push(
        <GigGroup
          key={year}
          width={gigsWidth}
          year={year}
          gigs={gigMap.get(year)!}
        />
      );
    }
    return groups;
  }, [gigMap]);
  return (
    <Page
      name={'Auftritte'}
      meta={{ description: 'Alle Auftritte von roadone' }}
      pageURL={'gigs'}
    >
      {Permission.isGreaterOrEqual(
        Permission.useRole(),
        Globals.permissionMap.postEvents
      ) && <AddEventPanel />}
      <Stack as={'main'} direction={'column'} spacing={'md'} hAlign>
        {gigGroupArray as any /* <- why not assignable? */}
        {hasNextPage && (
          <Button.Text
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {getGlobalMessage('general.load_more')}
          </Button.Text>
        )}
      </Stack>
    </Page>
  );
}

// <================================>
//   RESTRICTED (ADMIN) COMPONENTS
// <================================>

const testSchema = z.object({ message: z.string() });

function AddEventPanel() {
  const showDialog = useDialogHandle((s) => s.show);
  useForm({
    resolver: zodResolver(z.object({})),
  });
  return (
    <Stack hAlign sd={{ marginBottom: 'xl', childLength: gigsWidth }}>
      <div>
        <Button.Primary
          leading={<MdAdd />}
          onClick={() =>
            showDialog({
              title: 'Test',
              type: 'form',
              actions: DialogConfig.dialogSaveCancelSource,
              schema: testSchema,
              content: <AddGigForm />,
              handleSubmit: (e) => console.log(e),
            })
          }
        >
          {useMessage('general.add', 'Gig')}
        </Button.Primary>
      </div>
    </Stack>
  );
}

function AddGigForm() {
  const ctx = useFormContext<z.infer<typeof testSchema>>();
  return (
    <>
      <label>
        <p>Sample Form</p>
        <input type={'text'} {...ctx.register('message')} />
      </label>
    </>
  );
}
