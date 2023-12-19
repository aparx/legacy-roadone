/** @jsxImportSource @emotion/react */
import { FileUploadArea } from '@/components/FileUploadArea';
import { useDialogHandle } from '@/handles';
import { Permission } from '@/modules/auth/utils/permission';
import { MediaItem } from '@/modules/media/components/MediaItem';
import type {
  MediaGroupModel,
  MediaItemType,
  ProcessedMediaGroupModel,
} from '@/modules/media/media';
import {
  $mediaUrlItemContent,
  MediaItemContentData,
} from '@/modules/media/media';
import { api } from '@/utils/api';
import { useIsMobile } from '@/utils/device';
import { formatString } from '@/utils/format';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import {
  useDeleteDialog,
  useMutateDialog,
  UseMutateFormInput,
  UseMutateType,
} from '@/utils/pages/infinite/infiniteDialog';
import {
  InfiniteItem,
  InfiniteItemEvents,
} from '@/utils/pages/infinite/infiniteItem';
import { useTheme } from '@emotion/react';
import { Button, Card, Icon, Skeleton, Stack, Text, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { createStackProps } from 'next-ui/src/components/Stack/Stack';
import { ReactElement, ReactNode, useState } from 'react';
import { BsPinFill } from 'react-icons/bs';
import {
  MdAdd,
  MdAttachFile,
  MdDeleteForever,
  MdEdit,
  MdUpload,
} from 'react-icons/md';

import useGlobalPermission = Permission.useGlobalPermission;

export type MediaGroupProps = {
  /** The currently filtered type, which is used to show different variations of
   *  upload and showcase abilities. */
  type: MediaItemType;
  group: Omit<ProcessedMediaGroupModel, 'items'>;
} & InfiniteItemEvents<ProcessedMediaGroupModel>;

export default function MediaGroup(props: MediaGroupProps) {
  const { group, type, onDelete, onEdit } = props;
  const theme = useTheme();
  const isMobile = useIsMobile();
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    api.media.getItems.useInfiniteQuery({
      group: group.id,
      type,
      // TODO: limit: isMobile ? 4 : 6,
    });

  const canManage = useGlobalPermission('media.group.manage');

  // <===================================>
  //      MEDIA ITEM DIALOGS & EVENTS
  // <===================================>

  const addURLItemDialog = useMutateDialog({
    type: 'add',
    width: 'sm',
    endpoint: api.media.addURLItem.useMutation(),
    schema: $mediaUrlItemContent,
    form: (props) => (
      <MediaURLItemForm {...props} group={group} mediaType={type} />
    ),
  });

  const deleteItemDialog = useDeleteDialog({
    width: 'sm',
    title: useMessage('general.delete', 'Element'),
    endpoint: api.media.deleteItem.useMutation(),
  });

  const dialogHandle = useDialogHandle();

  const items = data?.pages?.flatMap((page) => page.data);
  return items?.length || isLoading || isFetching || canManage ? (
    <Card
      as={'article'}
      width={'xl'}
      style={{ position: 'relative' }}
      keepPadding
    >
      {group.pinned && (
        <Icon
          aria-hidden={true}
          icon={<BsPinFill size={18} />}
          sd={{
            position: 'absolute',
            top: 0,
            right: 0,
            margin: 'lg',
            background: (t) => t.sys.color.surface[1],
            roundness: 'full',
            padding: 'md',
          }}
          style={{ transform: 'rotate(45deg)' }}
        />
      )}
      <Card.Header subtitle={group.description}>
        <Stack direction={'row'} vAlign>
          <Card.Header.Title>{group.title}</Card.Header.Title>
          {canManage && (
            <Button.Text
              tight
              icon={<MdEdit />}
              onClick={() => onEdit({ item: group })}
              aria-label={getGlobalMessage(
                'general.edit',
                getGlobalMessage('media.group_name')
              )}
            />
          )}
          {canManage && (
            <Button.Text
              tight
              icon={<MdDeleteForever />}
              onClick={() => onDelete({ item: group })}
              aria-label={getGlobalMessage(
                'general.delete',
                getGlobalMessage('media.group_name')
              )}
            />
          )}
        </Stack>
      </Card.Header>
      <Card.Content {...createStackProps(theme, { spacing: 'xl' })}>
        {canManage && (
          <Stack direction={'row'} wrap>
            <Button.Secondary
              leading={<MdUpload />}
              onClick={() =>
                dialogHandle.show({
                  type: 'modal',
                  width: 'sm',
                  title: 'Upload',
                  actions: [],
                  content: <MediaUploadForm />,
                })
              }
            >
              {formatString(
                getGlobalMessage('media.manage.upload'),
                getGlobalMessage(`media.filter.type.${type}`)
              )}
            </Button.Secondary>
            {type !== 'AUDIO' && (
              <Button.Secondary leading={<MdAdd />} onClick={addURLItemDialog}>
                {formatString(
                  getGlobalMessage('media.manage.add'),
                  getGlobalMessage(`media.filter.type.${type}`)
                )}
              </Button.Secondary>
            )}
          </Stack>
        )}
        {group.typeItemCount ? (
          <Stack direction={'row'} wrap style={{ flexGrow: 1, flexShrink: 1 }}>
            {/* prettier-ignore */}
            {items?.map((x) => (
              <MediaItem
                key={x.id}
                item={x}
                group={group}
                onEdit={function (item: InfiniteItem<any>) {
                  throw new Error('Function not implemented.');
                }}
                onDelete={deleteItemDialog}
              />
            ))}
          </Stack>
        ) : null}
        {hasNextPage && (
          <Button.Text tight onClick={() => fetchNextPage()}>
            {getGlobalMessage('general.load_more')}
          </Button.Text>
        )}
      </Card.Content>
    </Card>
  ) : null;
}

function SkeletonGroup({ group }: MediaGroupProps) {
  const maxDisplay = Infinity; // TODO
  let missing = Math.min(group.typeItemCount, maxDisplay);
  const skeletonArray: ReactElement[] = new Array(missing);
  while (--missing >= 0)
    skeletonArray[missing] = (
      <Skeleton
        sd={{ flexGrow: 1, maxWidth: '400px' }}
        key={missing}
        width={200}
        height={250}
      />
    );
  return <>{skeletonArray}</>;
}

function MediaURLItemForm<TType extends UseMutateType>(
  props: UseMutateFormInput<TType, typeof $mediaUrlItemContent> & {
    group: MediaGroupModel;
    mediaType: MediaItemType;
  }
) {
  const form = useRawForm<MediaItemContentData>();
  form.methods.setValue('groupId', props.group.id);
  form.methods.setValue('type', props.mediaType);
  const item = props.type === 'edit' ? props.item : undefined;
  return (
    <Stack>
      <TextField
        placeholder={`${props.mediaType} URL`}
        name={'url'}
        hookform={form}
        field={{ defaultValue: item?.url ?? undefined }}
        required
      />
      <TextField
        placeholder={'Name'}
        name={'name'}
        hookform={form}
        field={{ defaultValue: item?.name ?? undefined }}
      />
    </Stack>
  );
}

// <==========================================>
//         MEDIA UPLOAD DIALOG CONTENT
// <==========================================>

function MediaUploadForm() {
  const [fileList, setFileList] = useState<FileList | null>(null);

  const dialogHandle = useDialogHandle();

  const itemList: ReactNode[] = [];
  if (fileList)
    for (let i = 0; i < fileList.length; ++i) {
      const item = fileList.item(i);
      if (!item) continue;
      // prettier-ignore
      itemList.push(<li><MediaUploadItem item={item} index={i} /></li>)
    }
  return (
    <Stack
      as={'form'}
      onSubmit={(e) => {
        for (let i of new FormData(e.target as HTMLFormElement).values()) {
          console.log(i);
        }
        e.preventDefault();
      }}
    >
      <FileUploadArea
        name={'files'}
        onFileSelect={(set) => setFileList(set)}
        multiple
      />
      {itemList.length !== 0 && (
        <Stack
          as={'ul'}
          spacing={'sm'}
          sd={{ maxHeight: '40dvh', overflowY: 'auto' }}
        >
          {itemList as any}
        </Stack>
      )}
      <Stack as={'footer'} direction={'row'}>
        <Button.Primary type={'submit'}>Submit</Button.Primary>
        <Button.Secondary onClick={dialogHandle.close}>Cancel</Button.Secondary>
      </Stack>
    </Stack>
  );
}

/**
 * Item that represents an already uploaded file.
 */
function MediaUploadItem(props: { item: File; index: number }) {
  const theme = useTheme();
  return (
    <Stack
      vAlign
      direction={'row'}
      sd={{
        paddingV: 'md',
        paddingH: 'lg',
        background: (t) => t.sys.color.surface[4],
        color: (t) => t.sys.color.scheme.onSurface,
        roundness: 'sm',
        overflow: 'hidden',
      }}
    >
      <MdAttachFile />
      <Text.Body size={'md'} style={{ flexGrow: 1 }}>
        <input
          name={`${props.index}`}
          type={'text'}
          placeholder={props.item.name}
          css={{
            background: 'transparent',
            fontFamily: 'inherit',
            letterSpacing: 'inherit',
            border: 'none',
            width: '100%',
            color: theme.sys.color.scheme.primary,
            '&::placeholder': {
              color: theme.sys.color.scheme.onSurface,
            },
          }}
        />
      </Text.Body>
    </Stack>
  );
}
