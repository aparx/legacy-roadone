import { Page } from '@/components';
import { Permission } from '@/modules/auth/utils/permission';
import type {
  GigMutateFunctionMap,
  RenderableGig,
} from '@/modules/gigs/components/GigCard/GigCard';
import { GigGroup } from '@/modules/gigs/components/GigGroup';
import { GigContentData, gigContentSchema } from '@/modules/schemas/gig';
import { apiRouter } from '@/server/routers/_api';
import type { GetGigsOutput } from '@/server/routers/gig';
import { api, queryClient } from '@/utils/api';
import { toDatetimeLocal } from '@/utils/functional/date';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import {
  useDeleteDialog,
  useMutateDialog,
  UseMutateFormInput,
  UseMutateType,
} from '@/utils/pages/infinite/infiniteDialog';
import { InfiniteData } from '@tanstack/react-query';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Button, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { ReactNode, useMemo } from 'react';
import { MdAdd, MdLocationCity, MdLocationPin, MdTitle } from 'react-icons/md';
import superjson from 'superjson';
import { BreakpointName } from 'theme-core';

module config {
  /** Width of all rendered gig group cards */
  export const gigWidth = 'md' satisfies BreakpointName;
}

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  await helpers.gig.getGigs.prefetchInfinite({ parseMarkdown: true });
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.gigs,
  };
}

export default function GigsPage() {
  // prettier-ignore
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    api.gig.getGigs.useInfiniteQuery({ parseMarkdown: true }, {
      trpc: { abortOnUnmount: true },
      staleTime: Infinity,
      getNextPageParam: (lastPage) => lastPage?.nextCursor
    });
  const apiEdit = api.gig.editGig.useMutation();
  const apiDelete = api.gig.deleteGig.useMutation();
  // Dialogs
  const editGigDialog = useMutateDialog({
    type: 'edit',
    endpoint: apiEdit,
    schema: gigContentSchema,
    dialogWidth: 'sm',
    form: (props) => <GigInputForm {...props} />,
  });
  const deleteGigDialog = useDeleteDialog({
    endpoint: apiDelete,
    dialogWidth: 'sm',
  });
  // Required render-data
  const gigGroups = useCreateGigGroups(data);
  return (
    <Page
      name={'Auftritte'}
      meta={{ description: 'Alle Auftritte von roadone' }}
      pageURL={'gigs'}
    >
      {Permission.useGlobalPermission('postEvents') && <AddEventPanel />}
      <Stack as={'main'} direction={'column'} spacing={'md'} hAlign>
        <>
          {useRenderGigGroups(gigGroups, {
            // potential bottleneck: underlying `useMemo` with this obj as dep.
            onEdit: editGigDialog,
            onDelete: deleteGigDialog,
          })}
        </>
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
//       RESTRICTED COMPONENTS
// <================================>

function AddEventPanel() {
  const endpoint = api.gig.addGig.useMutation();
  const addDialog = useMutateDialog({
    type: 'add',
    dialogWidth: 'sm',
    endpoint,
    form: (props) => <GigInputForm {...props} />,
    schema: gigContentSchema,
  });
  return (
    <Stack hAlign sd={{ marginBottom: 'xl', childLength: config.gigWidth }}>
      <div>
        <Button.Primary leading={<MdAdd />} onClick={() => addDialog()}>
          {useMessage('general.add', getGlobalMessage('aria.gig.name'))}
        </Button.Primary>
      </div>
    </Stack>
  );
}

// <================================>
//           GIG DATA HOOKS
// <================================>

/** Creates gig groups by year and sorts them after descending order. */
function useCreateGigGroups(data: InfiniteData<GetGigsOutput> | undefined) {
  return useMemo(() => {
    // Gig to year map
    const gigMap = new Map<number, RenderableGig[]>();
    const current = Date.now();
    let _next: RenderableGig | undefined;
    data?.pages
      .flatMap(({ data }) => data.flat() as RenderableGig[])
      // we sort descending (newest [top] -> oldest [bottom])
      .sort((a, b) => (a.start.getTime() < b.start.getTime() ? 1 : -1))
      .forEach((gig) => {
        const year = gig.start.getFullYear();
        if (!gigMap.has(year)) gigMap.set(year, []);
        gigMap.get(year)!.push(gig);
        if (current - Globals.gigLength >= gig.start.getTime()) {
          gig.state = 'done'; // `gig` is already finished ("done")
        } else if (!_next || gig.start.getTime() < _next?.start?.getTime()) {
          gig.state = 'upcoming';
          _next = gig; // `gig` is closer to now than previous gigs (time-wise)
        } else gig.state = 'upcoming';
      });
    if (_next) _next.state = 'next';
    return gigMap;
  }, [data]);
}

/** Converts `yearToGigMap` into renderable `GigGroup` elements. */
function useRenderGigGroups(
  yearToGigMap: Map<number, RenderableGig[]>,
  functionMap: GigMutateFunctionMap
) {
  return useMemo(() => {
    const groups: ReactNode[] = [];
    for (const [year, gig] of yearToGigMap.entries()) {
      groups.push(
        <GigGroup
          key={year}
          width={config.gigWidth}
          year={year}
          gigs={gig}
          events={functionMap}
        />
      );
    }
    return groups;
  }, [yearToGigMap, functionMap]);
}

// <======================================>
//                GIG FORMS
// <======================================>

function GigInputForm<TType extends UseMutateType>(
  props: UseMutateFormInput<TType, typeof gigContentSchema>
) {
  const {
    endpoint: { isLoading },
  } = props;
  const form = useRawForm<GigContentData>();
  const item = props.type === 'edit' ? props.item : undefined;
  return (
    <Stack spacing={'lg'}>
      {isLoading && <div>LOADING...</div>}
      <TextField
        name={'title'}
        placeholder={getGlobalMessage('translation.title')}
        field={{ defaultValue: item?.title }}
        leading={<MdTitle />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        leading
        name={'start'}
        placeholder={getGlobalMessage('gig.start')}
        field={{
          defaultValue: item?.start ? toDatetimeLocal(item.start) : undefined,
        }}
        type={'datetime-local'}
        required
        disabled={isLoading}
        hookform={{ ...form, options: { valueAsDate: true } }}
      />
      <TextField
        name={'city'}
        placeholder={getGlobalMessage('translation.city')}
        field={{ defaultValue: item?.city }}
        leading={<MdLocationCity />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'street'}
        placeholder={getGlobalMessage('translation.street')}
        field={{ defaultValue: item?.street }}
        leading={<MdLocationPin />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'postcode'}
        placeholder={getGlobalMessage('translation.postcode')}
        field={{ defaultValue: item?.postcode }}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'description'}
        placeholder={getGlobalMessage('translation.description')}
        field={{ defaultValue: item?.description ?? undefined }}
        disabled={isLoading}
        hookform={form}
      />
    </Stack>
  );
}
