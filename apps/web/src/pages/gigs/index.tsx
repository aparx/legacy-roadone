import { DialogConfig, Page } from '@/components';
import { useToastHandle } from '@/handles';
import { useDialogHandle } from '@/handles/DialogHandle/DialogHandle.store';
import { Permission } from '@/modules/auth/utils/permission';
import { RenderableGig } from '@/modules/gigs/components/GigCard/GigCard';
import { GigGroup } from '@/modules/gigs/components/GigGroup';
import { InputGig, inputGigSchema } from '@/modules/schemas/gig';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { UseTRPCMutationResult } from '@trpc/react-query/shared';
import { Button, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { ReactNode, useMemo } from 'react';
import { MdAdd, MdLocationCity, MdLocationPin, MdTitle } from 'react-icons/md';
import superjson from 'superjson';
import { BreakpointName } from 'theme-core';

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

function AddEventPanel() {
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const mutation = api.gig.addGig.useMutation();
  const addName = useMessage('general.add', getGlobalMessage('aria.gig.name'));
  const addToast = useToastHandle((s) => s.add);
  return (
    <Stack hAlign sd={{ marginBottom: 'xl', childLength: gigsWidth }}>
      <div>
        <Button.Primary
          leading={<MdAdd />}
          onClick={() =>
            showDialog({
              title: addName,
              type: 'form',
              width: 'sm',
              actions: DialogConfig.dialogSaveCancelSource,
              schema: inputGigSchema,
              content: <AddGigForm mutation={mutation} />,
              handleSubmit: (data) => {
                mutation.mutate(data, {
                  onSuccess: closeDialog,
                  onError: (error) => {
                    console.log(error, error.message);
                    addToast({
                      type: 'error',
                      message: `Fehler: ${getGlobalMessage(
                        error.message as any
                      )}`,
                      title: 'Aktion fehlgeschlagen!',
                      duration: 'normal',
                    });
                  },
                });
              },
            })
          }
        >
          {addName}
        </Button.Primary>
      </div>
    </Stack>
  );
}

function AddGigForm({
  mutation,
}: {
  mutation: UseTRPCMutationResult<InputGig, any, InputGig, any>;
}) {
  const { isLoading } = mutation;
  const form = useRawForm<InputGig>();
  return (
    <Stack spacing={'lg'}>
      {isLoading && <div>LOADING...</div>}
      <TextField
        name={'title'}
        placeholder={getGlobalMessage('translation.title')}
        leading={<MdTitle />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        leading
        name={'start'}
        placeholder={getGlobalMessage('gig.start')}
        type={'datetime-local'}
        required
        disabled={isLoading}
        hookform={{ ...form, options: { valueAsDate: true } }}
      />
      <TextField
        name={'city'}
        placeholder={getGlobalMessage('translation.city')}
        leading={<MdLocationCity />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'street'}
        placeholder={getGlobalMessage('translation.street')}
        leading={<MdLocationPin />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'postcode'}
        placeholder={getGlobalMessage('translation.postcode')}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'description'}
        placeholder={getGlobalMessage('translation.description')}
        disabled={isLoading}
        hookform={form}
      />
    </Stack>
  );
}
