import { LoadMoreButton } from '@/components/LoadMoreButton';
import { Page } from '@/layout/components';
import { Permission } from '@/modules/auth/utils/permission';
import { MediaGroup } from '@/modules/media/components/MediaGroup';
import { MediaSwitch } from '@/modules/media/components/MediaSwitch';
import { $mediaGroupContent, MediaGroupContentData, MediaItemType, mediaItemTypeArray, ProcessedMediaGroupModel } from '@/modules/media/media';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { formatString } from '@/utils/format';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { LocalState } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { useDeleteDialog, useMutateDialog, UseMutateFormInput, UseMutateType } from '@/utils/pages/infinite/infiniteDialog';
import { useTheme } from '@emotion/react';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Button, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { useId, useMemo } from 'react';
import { MdAdd } from 'react-icons/md';
import superjson from 'superjson';
import { create } from 'zustand';


import useGlobalPermission = Permission.useGlobalPermission;

export const useFilterMediaType = create<LocalState<MediaItemType>>((set) => ({
  state: mediaItemTypeArray[0],
  set: (type: MediaItemType) => set({ state: type }),
}));

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  await helpers.media.getGroups.prefetchInfinite({
    type: mediaItemTypeArray[0],
  });
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.media,
  };
}

export default function MediaPage() {
  const filter = useFilterMediaType();
  // prettier-ignore
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    api.media.getGroups.useInfiniteQuery({ type: filter.state }, {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    });
  const canManageGroup = useGlobalPermission('media.group.manage');
  const groups: ProcessedMediaGroupModel[] = useMemo(() => {
    const groupArray = data?.pages?.flatMap((page) => page.data) as
      | ProcessedMediaGroupModel[]
      | undefined;
    if (groupArray && !canManageGroup)
      return groupArray.filter((x) => x.typeItemCount);
    return groupArray || [];
  }, [canManageGroup, data?.pages]);
  const controls = useId();

  // <===================================>
  //     MEDIA GROUP DIALOGS & EVENTS
  // <===================================>

  const addGroupDialog = useMutateDialog({
    type: 'add',
    width: 'sm',
    endpoint: api.media.addGroup.useMutation(),
    schema: $mediaGroupContent,
    title: useMessage('general.add', getGlobalMessage('media.group_name')),
    form: (props) => <MediaGroupForm {...props} />,
  });

  const editGroupDialog = useMutateDialog({
    type: 'edit',
    width: 'sm',
    endpoint: api.media.editGroup.useMutation(),
    schema: $mediaGroupContent,
    title: useMessage('general.edit', getGlobalMessage('media.group_name')),
    form: (props) => <MediaGroupForm {...props} />,
  });

  const deleteGroupDialog = useDeleteDialog({
    width: 'sm',
    title: useMessage('general.delete', getGlobalMessage('media.group_name')),
    endpoint: api.media.deleteGroup.useMutation(),
  });

  const theme = useTheme();

  return (
    <Page name={'Medien'} page={'media'}>
      <Stack hAlign sd={{ childLength: 'xl' }}>
        <MediaSwitch
          state={filter}
          // disabled={isLoading || isFetching}
          aria-controls={controls}
        />
        <Stack as={'main'} sd={{ marginTop: 'md' }} id={controls}>
          {canManageGroup && (
            <Button.Primary leading={<MdAdd />} onClick={addGroupDialog}>
              {formatString(
                getGlobalMessage('general.add'),
                getGlobalMessage('media.group_name')
              )}
            </Button.Primary>
          )}
          {groups.map((group: ProcessedMediaGroupModel) => (
            <MediaGroup
              key={group.id}
              type={filter.state}
              group={group}
              onDelete={deleteGroupDialog}
              onEdit={editGroupDialog}
            />
          ))}
          {hasNextPage && (
            <LoadMoreButton
              updating={isLoading || isFetching}
              name={getGlobalMessage('general.load_more')}
              fetchNextPage={fetchNextPage}
              take={{ vPaddingMode: 'flow' }}
            />
          )}
        </Stack>
      </Stack>
    </Page>
  );
}

function MediaGroupForm<TType extends UseMutateType>(
  props: UseMutateFormInput<TType, typeof $mediaGroupContent>
) {
  const form = useRawForm<MediaGroupContentData>();
  const item = props.type === 'edit' ? props.item : undefined;
  return (
    <Stack>
      <TextField
        placeholder={getGlobalMessage('translation.title')}
        name={'title'}
        hookform={form}
        field={{ defaultValue: item?.title }}
      />
      <TextField
        placeholder={getGlobalMessage('translation.description')}
        name={'description'}
        hookform={form}
        field={{ defaultValue: item?.description }}
      />
      <label>
        {/* TODO replace with checkbox */}
        {getGlobalMessage('translation.pinned')}
        <input
          type={'checkbox'}
          defaultChecked={item?.pinned}
          {...form.methods.register('pinned')}
        />
      </label>
    </Stack>
  );
}