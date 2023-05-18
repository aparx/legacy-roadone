import { DialogConfig, Page } from '@/components';
import { useToastHandle } from '@/handles';
import { useDialogHandle } from '@/handles/DialogHandle/DialogHandle.store';
import { Permission } from '@/modules/auth/utils/permission';
import type {
  GigMutateFunction,
  GigMutateFunctionMap,
  RenderableGig,
} from '@/modules/gigs/components/GigCard/GigCard';
import { GigGroup } from '@/modules/gigs/components/GigGroup';
import {
  EditGig,
  GigEvent,
  InputGig,
  inputGigSchema,
} from '@/modules/schemas/gig';
import { apiRouter } from '@/server/routers/_api';
import type { GetGigsResult } from '@/server/routers/gig';
import { api, queryClient } from '@/utils/api';
import { toDatetimeLocal } from '@/utils/functional/date';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteData } from '@tanstack/react-query';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { UseTRPCMutationResult } from '@trpc/react-query/shared';
import { Button, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { ReactNode, useCallback, useMemo } from 'react';
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
  // Dialogs
  const editGigDialog = useMutateGigDialog({ type: 'edit', endpoint: apiEdit });
  const deleteGigDialog = useDeleteGigDialog();
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
  const mutation = api.gig.addGig.useMutation();
  const addGigDialog = useMutateGigDialog({ type: 'add', endpoint: mutation });
  return (
    <Stack hAlign sd={{ marginBottom: 'xl', childLength: config.gigWidth }}>
      <div>
        <Button.Primary leading={<MdAdd />} onClick={() => addGigDialog()}>
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
function useCreateGigGroups(data: InfiniteData<GetGigsResult> | undefined) {
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
//               GIG DIALOGS
// <======================================>

function useDeleteGigDialog(): GigMutateFunction {
  const apiDelete = api.gig.deleteGig.useMutation();
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const addToast = useToastHandle((s) => s.add);
  return useCallback(
    (gig: GigEvent) => {
      const { id } = gig;
      showDialog({
        title: getGlobalMessage('modal.sureTitle'),
        type: 'modal',
        actions: DialogConfig.dialogYesCancelSource,
        width: 'sm',
        content: `Du bist gerade dabei, den Auftritt '${gig.title}' zu löschen.`,
        onHandleYes: () => {
          closeDialog();
          apiDelete.mutate(
            { id },
            {
              onSuccess: () => {
                addToast({
                  type: 'success',
                  title: getGlobalMessage('general.actionSuccess'),
                  message: `Auftritt ${gig.title} erfolgreich gelöscht!`,
                });
              },
              onError: (error) => {
                addToast({
                  type: 'error',
                  title: getGlobalMessage('general.actionFailed'),
                  message: getGlobalMessage(
                    error as any,
                    getGlobalMessage('general.error')
                  ),
                });
              },
            }
          );
        },
      });
    },
    [addToast, apiDelete, closeDialog, showDialog]
  );
}

type GigDialogProps =
  | {
      type: 'add';
      endpoint: UseTRPCMutationResult<InputGig, any, InputGig, any>;
      gig?: GigEvent;
    }
  | {
      type: 'edit';
      endpoint: UseTRPCMutationResult<EditGig, any, EditGig, any>;
      gig?: GigEvent;
    };

function useMutateGigDialog(props: Omit<GigDialogProps, 'gig'>) {
  const { type, endpoint } = props;
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const addToast = useToastHandle((s) => s.add);
  const title = useMessage(`general.${type}`, getGlobalMessage('gig.name'));
  return useCallback(
    (gig?: GigEvent) => {
      showDialog({
        title,
        type: 'form',
        width: 'sm',
        actions: DialogConfig.dialogSaveCancelSource,
        schema: inputGigSchema,
        content: <GigInputForm {...({ ...props, gig } as GigDialogProps)} />,
        handleSubmit: (data) => {
          let newData: any = data;
          if (type === 'edit')
            newData = { ...data, id: gig!.id } satisfies EditGig;
          endpoint.mutate(newData, {
            onSuccess: () => {
              closeDialog();
              addToast({
                type: 'success',
                title: getGlobalMessage('general.actionSuccess'),
                message: getGlobalMessage(`responses.gig.${type}_success`),
              });
            },
            onError: (error) => {
              addToast({
                type: 'error',
                title: getGlobalMessage('general.actionSuccess'),
                message: `${getGlobalMessage(
                  error.message as any,
                  error.message
                )}`,
              });
            },
          });
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showDialog, type, endpoint, closeDialog, addToast]
  );
}

// <======================================>
//                GIG FORMS
// <======================================>

function GigInputForm({ endpoint, gig }: GigDialogProps) {
  const { isLoading } = endpoint;
  const form = useRawForm<InputGig>();
  return (
    <Stack spacing={'lg'}>
      {isLoading && <div>LOADING...</div>}
      <TextField
        name={'title'}
        placeholder={getGlobalMessage('translation.title')}
        field={{ defaultValue: gig?.title }}
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
          defaultValue: gig?.start ? toDatetimeLocal(gig.start) : undefined,
        }}
        type={'datetime-local'}
        required
        disabled={isLoading}
        hookform={{ ...form, options: { valueAsDate: true } }}
      />
      <TextField
        name={'city'}
        placeholder={getGlobalMessage('translation.city')}
        field={{ defaultValue: gig?.city }}
        leading={<MdLocationCity />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'street'}
        placeholder={getGlobalMessage('translation.street')}
        field={{ defaultValue: gig?.street }}
        leading={<MdLocationPin />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'postcode'}
        placeholder={getGlobalMessage('translation.postcode')}
        field={{ defaultValue: gig?.postcode }}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'description'}
        placeholder={getGlobalMessage('translation.description')}
        field={{ defaultValue: gig?.description ?? undefined }}
        disabled={isLoading}
        hookform={form}
      />
    </Stack>
  );
}
