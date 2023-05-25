/** @jsxImportSource @emotion/react */
import { BlogReplyCard, BlogReplyCardConfig } from '../BlogReplyCard';
import * as style from './BlogReplyGroup.style';
import { Permission } from '@/modules/auth/utils/permission';
import { BlogReplyData } from '@/modules/blogs/blogReply';
import { BlogReplyField } from '@/modules/blogs/components/BlogReplyField';
import type { BlogReplyFieldRef } from '@/modules/blogs/components/BlogReplyField/BlogReplyField';
import { useBlogPost } from '@/modules/blogs/context/blogPostContext';
import type { CommentGroupNode } from '@/modules/blogs/groupSchema';
import { api } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { useDeleteDialog } from '@/utils/pages/infinite/infiniteDialog';
import { InfiniteItem } from '@/utils/pages/infinite/infiniteItem';
import { useTheme } from '@emotion/react';
import { Button, Icon, Skeleton, Stack } from 'next-ui';
import { ReactElement, RefObject, useMemo } from 'react';
import { MdWarning } from 'react-icons/md';

export type BlogCommentGroupProps = {
  group: CommentGroupNode;
  replyCount: number;
  disabled?: boolean;
  fieldRef?: RefObject<BlogReplyFieldRef>;
  /** Function that is called in order to refetch the blog data. */
};

export default function BlogReplyGroup(props: BlogCommentGroupProps) {
  const blogPost = useBlogPost();
  const { group, fieldRef, replyCount, disabled } = props;
  const queryParams = {
    limit: Globals.replyFetchLimit,
    blogId: group.root.id,
    parentId: group.path.at(-1),
  };
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.blog.reply.getReplies.useInfiniteQuery(queryParams, {
    // enabled: useSession().status !== 'loading' || !Globals.prioritiseSelfReplies,
    trpc: { abortOnUnmount: true },
    staleTime: Infinity, // updated automatically when changed
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
  const replies = useMemo(() => data?.pages?.flatMap((p) => p.data), [data]);
  const canPostReply = Permission.useGlobalPermission('blog.comment.post');
  const deleteEndpoint = api.blog.reply.deleteReply.useMutation();
  const deleteDialog = useDeleteDialog({
    title: useMessage('general.delete', getGlobalMessage('blog.reply.name')),
    endpoint: deleteEndpoint,
    content: deleteDialogContent,
    width: 'md',
    onSuccess: ({ deleted, root }) => {
      refetch({ type: 'all' }).then(() =>
        blogPost.data.set((state) => ({
          ...state,
          totalReplyCount: state.totalReplyCount - deleted,
          replyCount:
            root.type === 'reply' && root.node.parentId == null
              ? state.replyCount - 1
              : state.replyCount,
        }))
      );
    },
  });
  const repliesShown = replies?.length ?? 0;
  const isLoadingData = isRefetching || isLoading || deleteEndpoint.isLoading;
  return (
    <Stack css={style.blogReplyGroup} spacing={'lg'}>
      {group.path.length < Globals.maxReplyDepth &&
        (!group.parent || canPostReply) && (
          <BlogReplyField
            group={group}
            ref={fieldRef}
            field={{ disabled: disabled || isLoadingData }}
            isLoading={isLoadingData}
            onAdded={(data) => {
              refetch().then(() => {
                // TODO consider Zustand for this
                blogPost.data.set((state) => ({
                  ...state,
                  totalReplyCount: 1 + state.totalReplyCount,
                  replyCount: data.parentId
                    ? state.replyCount
                    : 1 + state.replyCount,
                }));
                const field = fieldRef?.current?.textField?.field;
                if (!field) return;
                field.blur();
                field.value = '';
              });
            }}
          />
        )}
      {(repliesShown !== 0 || replyCount !== 0) && (
        <Stack as={'ol'} aria-label={getGlobalMessage('translation.replies')}>
          {replies?.map((reply) => (
            <li key={reply.id}>
              <BlogReplyCard
                // TODO
                // disabled={isRefetching || isLoading}
                reply={reply}
                parent={group}
                disabled={isLoadingData || disabled}
                onDelete={deleteDialog}
              />
            </li>
          ))}
          {(isLoading || isFetchingNextPage) && (
            <ReplySkeletonGroup
              totalCount={replyCount ?? 0}
              countDisplayed={repliesShown}
            />
          )}
          {hasNextPage && (
            <Button.Text
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {getGlobalMessage('general.load_more')}
            </Button.Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/** Content shown with the `delete`-Dialog, when a User is about to delete a reply. */
const deleteDialogContent = ({ item }: InfiniteItem<BlogReplyData>) => {
  return (
    <Stack>
      {item.replyCount === 0 ? (
        getGlobalMessage('blog.reply.dialog.message_delete_zero')
      ) : (
        <Stack as={'span'} direction={'row'} vAlign>
          <Icon icon={<MdWarning size={18} />} />
          {getGlobalMessage('blog.reply.dialog.message_delete_multiple')}
        </Stack>
      )}
      <BlogReplyCard
        reply={item}
        visualOnly
        sd={{
          padding: 'md',
          background: (t) => t.sys.color.surface[2],
        }}
      />
    </Stack>
  );
};

type ReplySkeletonGroupProps = {
  /** The total amount of replies in this depth-level. */
  totalCount?: number;
  /** The amount of skeletons or replies already shown in this depth-level. */
  countDisplayed?: number;
};

function ReplySkeletonGroup({
  totalCount,
  countDisplayed,
}: ReplySkeletonGroupProps) {
  const limit = Globals.replyFetchLimit;
  let displayCount =
    !totalCount || countDisplayed == null
      ? Math.round(limit / 2)
      : Math.round(Math.min(totalCount - countDisplayed, limit));
  const skeletons: ReactElement[] = new Array(displayCount);
  while (displayCount-- > 0)
    skeletons[displayCount] = <ReplySkeleton key={displayCount} />;
  return <>{skeletons}</>;
}

function ReplySkeleton() {
  const theme = useTheme();
  const baseColor = theme.sys.color.surface[5];
  const scanColor = theme.sys.color.scheme.surfaceVariant;
  return (
    <Stack direction={'row'} sd={{ padding: 'md' }}>
      <Skeleton
        width={BlogReplyCardConfig.avatarSize}
        height={BlogReplyCardConfig.avatarSize}
        roundness={'full'}
        baseColor={baseColor}
        scanColor={scanColor}
        style={{ flexShrink: 0 }}
      />
      <Stack spacing={'sm'} sd={{ width: '100%' }}>
        <Skeleton
          height={20}
          baseColor={baseColor}
          scanColor={scanColor}
          style={{ maxWidth: 250 }}
        />
        <Skeleton height={40} baseColor={baseColor} scanColor={scanColor} />
      </Stack>
    </Stack>
  );
}
