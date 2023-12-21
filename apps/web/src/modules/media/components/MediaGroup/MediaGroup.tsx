/** @jsxImportSource @emotion/react */
import { Permission } from '@/modules/auth/utils/permission';
import { MediaItem } from '@/modules/media/components/MediaItem';
import type {
  MediaGroupModel,
  MediaItemType,
  ProcessedMediaGroupModel,
} from '@/modules/media/media';
import {
  $mediaUrlItemContentMultiples,
  MediaUrlItemContentMultiples,
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
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { useTheme } from '@emotion/react';
import {
  Button,
  Card,
  Icon,
  Skeleton,
  Spinner,
  Stack,
  Text,
  TextField,
} from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { createStackProps } from 'next-ui/src/components/Stack/Stack';
import { ReactElement, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { BsPinFill } from 'react-icons/bs';
import { MdAdd, MdDelete, MdDeleteForever, MdEdit } from 'react-icons/md';

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
  // prettier-ignore
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    api.media.getItems.useInfiniteQuery({
      group: group.id,
      type,
      limit: isMobile ? 2 : 4
    }, { getNextPageParam: (lastPage) => lastPage?.nextCursor });

  const canManage = useGlobalPermission('media.group.manage');

  // <===================================>
  //      MEDIA ITEM DIALOGS & EVENTS
  // <===================================>

  const addURLItemDialog = useMutateDialog({
    type: 'add',
    width: 'md',
    endpoint: api.media.addURLItem.useMutation(),
    schema: $mediaUrlItemContentMultiples,
    form: (props) => (
      <MediaURLItemForm {...props} group={group} mediaType={type} />
    ),
  });

  const deleteItemDialog = useDeleteDialog({
    width: 'sm',
    title: useMessage('general.delete', 'Element'),
    endpoint: api.media.deleteItem.useMutation(),
  });

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
            <Button.Secondary leading={<MdAdd />} onClick={addURLItemDialog}>
              {formatString(
                getGlobalMessage('media.manage.add'),
                getGlobalMessage(`media.filter.type.${type}`)
              )}
            </Button.Secondary>
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
                onDelete={deleteItemDialog}
              />
            ))}
          </Stack>
        ) : null}
        {hasNextPage && (
          <Button.Text
            tight
            onClick={() => fetchNextPage()}
            disabled={isLoading || isFetching}
            icon={
              (isLoading || isFetching) && (
                <Spinner size={2 + theme.sys.typescale.body.md.fontSize} />
              )
            }
          >
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
  props: UseMutateFormInput<TType, typeof $mediaUrlItemContentMultiples> & {
    group: MediaGroupModel;
    mediaType: MediaItemType;
  }
) {
  const form = useRawForm<MediaUrlItemContentMultiples>();
  const { control } = form.methods;

  const item = props.type === 'edit' ? props.item : undefined;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
    rules: { minLength: 1, required: true },
  });

  const appendItem = () =>
    append({
      type: props.mediaType,
      groupId: props.group.id,
      url: null,
      name: null,
    });

  useEffect(() => {
    if (fields.length == 0) appendItem();
  }, []);

  const content = fields.map((field, index) => (
    <Stack key={field.id} direction={'row'}>
      <TextField
        placeholder={`Ressourcen-URL (${props.mediaType})`}
        field={{ defaultValue: item?.[index]?.url ?? undefined }}
        name={`items.${index}.url`}
        hookform={form}
        style={{ width: '80%' }}
        required
        tight
      />
      <TextField
        placeholder={'Beschreibung'}
        field={{ defaultValue: item?.[index]?.name ?? undefined }}
        name={`items.${index}.name`}
        hookform={form}
        tight
      />
      <Button.Surface
        size={'md'}
        icon={<MdDelete />}
        tight
        disabled={fields.length === 1}
        onClick={() => remove(index)}
      />
    </Stack>
  ));

  return (
    <Stack spacing={'xxl'}>
      <Text.Label size={'lg'}>
        Füge neue Elemente ein. Diese sind, wenn sie keine ganze URL darstellen,
        automatisch relativ zu der öffentlichen S3 storage URL.
      </Text.Label>

      <Stack style={{ maxHeight: '50dvh', overflowY: 'auto' }}>{content}</Stack>

      <Button.Secondary onClick={() => appendItem()} icon={<MdAdd />}>
        Weitere Ressource hinzufügen
      </Button.Secondary>
    </Stack>
  );
}
