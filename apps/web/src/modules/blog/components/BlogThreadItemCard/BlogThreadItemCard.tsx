/** @jsxImportSource @emotion/react */
import { BlogThreadItemCardConfig as config } from './BlogThreadItemCard.config';
import { Avatar } from '@/components';
import { Username } from '@/components/Username';
import { Permission } from '@/modules/auth/utils/permission';
import { BlogThreadItem, ProcessedBlogPostModel } from '@/modules/blog/blog';
import { BlogThreadGroup } from '@/modules/blog/components/BlogThreadGroup';
import { BlogThread } from '@/modules/blog/utils/thread/blogThread';
import type { DeleteThreadItemOutput } from '@/server/routers/blog/thread/deleteItem';
import { api } from '@/utils/api';
import { useWindowBreakpoint } from '@/utils/context/windowBreakpoint';
import { formatString } from '@/utils/format';
import { useRelativeTime } from '@/utils/hooks/useRelativeTime';
import { useLocalToggle } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { useDeleteDialog } from '@/utils/pages/infinite/infiniteDialog';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { useRegreplURL } from '@/utils/urlReplace';
import { scrollInViewIfNeeded } from '@/utils/viewport';
import { useTheme } from '@emotion/react';
import { useSession } from 'next-auth/react';
import type { StyleableProp } from 'next-ui';
import { Button, Stack, Text, UI, useStyleableMerge } from 'next-ui';
import { TextFieldRef } from 'next-ui/src/components/TextField/TextField';
import {
  HTMLAttributes,
  RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import { MdDeleteForever, MdExpandLess, MdExpandMore } from 'react-icons/md';

// prettier-ignore
type InternalEventCallbacks =
  InfiniteItemEvents<DeleteThreadItemOutput, 'delete'>;

export type InternalBlogThreadItemCardProps = {
  blog: ProcessedBlogPostModel;
  group: BlogThread;
  item: BlogThreadItem;
  /** If true shows a deep loading state. */
  loading?: boolean;
  /** Reply field of `group` */
  groupField?: RefObject<TextFieldRef>;
} & (
  | ({ visualOnly?: false | undefined } & InternalEventCallbacks)
  | ({ visualOnly: true } & Partial<Record<keyof InternalEventCallbacks, null>>)
);

export type BlogThreadItemCardProps = StyleableProp &
  HTMLAttributes<HTMLDivElement> &
  InternalBlogThreadItemCardProps;

export default function BlogThreadItemCard(props: BlogThreadItemCardProps) {
  const {
    blog,
    group,
    item,
    visualOnly,
    groupField,
    onDelete,
    loading,
    ...rest
  } = props;
  let loadingState = loading;
  const session = useSession();
  const labelledBy = useId();
  const replyControls = useId();
  const canNestMore = item.type !== 'reply';
  const canShowMore =
    canNestMore && item.replyCount != null && item.replyCount !== 0;
  const canDelete =
    item.authorId == session.data?.user?.id ||
    Permission.hasGlobalPermission(session.data, 'blog.thread.manage');
  const replyState = useLocalToggle();
  const fieldRef = useRef<TextFieldRef>(null);
  const groupFieldRef = useRef(groupField);
  const triggerAutoFocus = useRef(false);
  const theme = useTheme();
  // prettier-ignore
  useEffect(() => {
    groupFieldRef.current = groupField;
  });
  useEffect(() => {
    if (replyState.state && triggerAutoFocus.current) {
      fieldRef.current?.field?.focus();
      triggerAutoFocus.current = false;
    }
  }, [replyState.state]);
  const openReply = useCallback(() => {
    triggerAutoFocus.current = true;
    fieldRef.current?.focus();
    const parentField = groupFieldRef.current?.current?.field;
    let scrollTarget: HTMLElement | undefined | null;
    if (group.type === 'comment') {
      replyState.set(true);
      scrollTarget = fieldRef?.current?.field;
    } else if (parentField) {
      if (item.author?.name) parentField.value = `@${item.author.name} `;
      parentField.focus();
      scrollTarget = parentField;
    }
    if (scrollTarget) scrollInViewIfNeeded(theme, scrollTarget);
  }, [group.type, item.author?.name, replyState, theme]);

  const deleteEndpoint = api.blog.threads.deleteItem.useMutation();
  loadingState ||= deleteEndpoint.isLoading;

  const deleteDialog = useDeleteDialog({
    title: formatString(
      getGlobalMessage('general.delete'),
      getGlobalMessage('blog.comment.name')
    ),
    width: 'md',
    tight: true,
    successResponse: {
      message: getGlobalMessage('responses.blog.reply_delete_success'),
    },
    endpoint: deleteEndpoint,
    onSuccess: (item) => !visualOnly && onDelete?.({ item }),
    content: () => (
      <Stack spacing={'lg'} aria-hidden={true}>
        <span>Du bist dabei, folgenden Kommentar zu löschen</span>
        <BlogThreadItemCard
          blog={blog}
          group={group}
          item={item}
          visualOnly
          sd={{
            background: (t) => t.sys.color.surface[4],
            padding: 'lg',
            roundness: UI.generalRoundness,
          }}
        />
      </Stack>
    ),
  });

  const breakpoint = useWindowBreakpoint();

  const canReply = session.status === 'authenticated';

  return (
    <Stack
      as={'article'}
      aria-labelledby={labelledBy}
      data-reply-count={item.type === 'comment' ? item.replyCount : undefined}
      {...useStyleableMerge(rest)}
    >
      <Stack direction={'row'}>
        <Avatar size={config.avatarSize} user={item.author} />
        <Stack spacing={0}>
          <Stack as={'header'} hSpacing={'md'} direction={'row'} wrap>
            <Text.Title
              as={'address'}
              size={'sm'}
              id={labelledBy}
              take={{ fontWeight: 'strong' }}
            >
              <Username user={item.author} />
            </Text.Title>
            <Text.Label
              as={'time'}
              size={'lg'}
              dateTime={item.createdAt.toISOString()}
              emphasis={'low'}
            >
              {useRelativeTime(item.createdAt)}
            </Text.Label>
          </Stack>
          <Text.Body size={'md'} emphasis={'medium'}>
            <>{useRegreplURL(item.content)}</>
          </Text.Body>
          <Stack
            direction={'row'}
            hSpacing={'md'}
            sd={{ emphasis: 'medium' }}
            wrap
          >
            {!visualOnly && canReply && (
              <Button.Text
                take={{ hPaddingMode: 'oof' }}
                aria-expanded={canNestMore ? replyState.state : undefined}
                aria-controls={canNestMore ? replyControls : undefined}
                onClick={openReply}
              >
                {getGlobalMessage('blog.comment.replyAddSingle')}
              </Button.Text>
            )}
            {!visualOnly && canShowMore && (
              <Button.Text
                leading={replyState.state ? <MdExpandLess /> : <MdExpandMore />}
                data-reply-count={item.replyCount}
                aria-expanded={canNestMore ? replyState.state : undefined}
                aria-controls={canNestMore ? replyControls : undefined}
                onClick={replyState.toggle}
              >
                {getGlobalMessage(
                  replyState.state
                    ? 'blog.comment.multiHide'
                    : 'blog.comment.multiShow'
                )}
              </Button.Text>
            )}
            {!visualOnly && canDelete && (
              <Button.Text
                tight
                sd={{ color: (t) => t.sys.color.scheme.error }}
                leading={<MdDeleteForever />}
                onClick={() => deleteDialog({ item })}
              >
                {breakpoint?.to?.gte('md') &&
                  getGlobalMessage('translation.delete')}
              </Button.Text>
            )}
          </Stack>
        </Stack>
      </Stack>
      {replyState.state && (
        <section
          id={replyControls}
          aria-label={getGlobalMessage('translation.replies')}
        >
          <BlogThreadGroup
            blog={blog}
            loading={loadingState}
            approximation={(item.type === 'comment' && item.replyCount) || 0}
            fieldRef={fieldRef}
            group={{ type: 'reply', blog: blog.id, parent: item.id }}
          />
        </section>
      )}
    </Stack>
  );
}
