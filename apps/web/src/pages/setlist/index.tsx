import { LoadMoreButton } from '@/components/LoadMoreButton';
import { Page } from '@/layout/components';
import { Permission } from '@/modules/auth/utils/permission';
import { SongCard } from '@/modules/setlist/components/SongCard';
import { $songContent, SongContentData } from '@/modules/setlist/song';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import {
  useDeleteDialog,
  useMutateDialog,
  UseMutateFormInput,
  UseMutateType,
} from '@/utils/pages/infinite/infiniteDialog';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Button, Card, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';
import { useMemo } from 'react';
import { MdAdd, MdEmail } from 'react-icons/md';
import superjson from 'superjson';
import { BreakpointName } from 'theme-core';

import useGlobalPermission = Permission.useGlobalPermission;

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  await helpers.setlist.getSetlist.prefetchInfinite({});
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.setlist,
  };
}

const dialogWidth = 'sm' satisfies BreakpointName;

// <==> /media <==>
export default function SetlistPage() {
  const { data, isLoading, isFetching, fetchNextPage, refetch, hasNextPage } =
    api.setlist.getSetlist.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );
  const songs = useMemo(() => {
    return data?.pages?.flatMap((page) => page.data) ?? [];
  }, [data]);

  const addTitle = useMessage(
    'general.add',
    getGlobalMessage('media.song_name')
  );

  const addDialog = useMutateDialog({
    type: 'add',
    schema: $songContent,
    title: addTitle,
    width: dialogWidth,
    endpoint: api.setlist.addSong.useMutation(),
    form: (props) => <SongCardForm {...props} />,
    onSuccess: () => refetch({ type: 'all' }),
  });

  const editDialog = useMutateDialog({
    type: 'edit',
    schema: $songContent,
    title: useMessage('general.edit', getGlobalMessage('media.song_name')),
    width: dialogWidth,
    endpoint: api.setlist.editSong.useMutation(),
    form: (props) => <SongCardForm {...props} />,
    onSuccess: () => refetch({ type: 'all' }),
  });

  const deleteDialog = useDeleteDialog({
    width: dialogWidth,
    title: useMessage('general.delete', getGlobalMessage('media.song_name')),
    endpoint: api.setlist.deleteSong.useMutation(),
    content: ({ item }) => {
      return <SongCard aria-hidden={true} song={item} visualOnly={true} />;
    },
    onSuccess: () => refetch({ type: 'all' }),
  });

  const canAdd = useGlobalPermission('setlist.add');

  return (
    <Page
      name={'Setlist'}
      page={'setlist'}
      {...useStackProps({ hAlign: true, spacing: 'xxl' })}
    >
      <Card width={'md'} keepPadding>
        <Card.Header
          {...useStackProps({ direction: 'row', hAlign: 'space-between' })}
        >
          <Card.Header.Title>Songs, die wir spielen</Card.Header.Title>
          {canAdd && (
            <Button.Primary
              onClick={addDialog}
              tight
              icon={<MdAdd />}
              iconName={addTitle}
            />
          )}
        </Card.Header>
        <Card.Content
          {...useStackProps({ spacing: 'xl' })}
          sd={{ marginTop: 'xl' }}
        >
          <Stack as={'ol'}>
            {songs.map((song) => (
              <li key={song.id}>
                <SongCard
                  markNew={
                    Date.now() - song.createdAt.getTime() <
                    Globals.setlistItemFreshTime
                  }
                  song={song}
                  onEdit={editDialog}
                  onDelete={deleteDialog}
                />
              </li>
            ))}
          </Stack>
          {hasNextPage && (
            <LoadMoreButton
              updating={isFetching || isLoading}
              fetchNextPage={fetchNextPage}
              name={getGlobalMessage('general.load_more')}
            />
          )}
        </Card.Content>
      </Card>
      <Stack
        vAlign
        aria-hidden={true}
        direction={'row'}
        spacing={'xxl'}
        {...usePinpointTextProps({ role: 'label', size: 'lg' })}
      >
        Du hast einen Vorschlag?
        <Button.Primary tabIndex={-1} link={'kontakt'} leading={<MdEmail />}>
          Kontakt
        </Button.Primary>
      </Stack>
    </Page>
  );
}

function SongCardForm<TType extends UseMutateType>(
  props: UseMutateFormInput<TType, typeof $songContent>
) {
  const form = useRawForm<SongContentData>();
  const item = props.type === 'edit' ? props.item : undefined;
  return (
    <Stack>
      <TextField
        placeholder={'Song name'}
        name={'name'}
        hookform={form}
        field={{ defaultValue: item?.name }}
      />
      <TextField
        placeholder={'Song artist'}
        name={'artist'}
        hookform={form}
        field={{ defaultValue: item?.artist }}
      />
    </Stack>
  );
}
