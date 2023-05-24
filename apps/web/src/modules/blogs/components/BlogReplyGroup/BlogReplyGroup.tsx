/** @jsxImportSource @emotion/react */
import { BlogReplyCard, BlogReplyCardConfig } from '../BlogReplyCard';
import * as style from './BlogReplyGroup.style';
import { Permission } from '@/modules/auth/utils/permission';
import { BlogReplyData } from '@/modules/blogs/blogReply';
import { BlogReplyField } from '@/modules/blogs/components/BlogReplyField';
import type { BlogReplyFieldRef } from '@/modules/blogs/components/BlogReplyField/BlogReplyField';
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
  estimatedReplyCount?: number;
  fieldRef?: RefObject<BlogReplyFieldRef>;
};

export default function BlogReplyGroup(props: BlogCommentGroupProps) {
  const { group, fieldRef, estimatedReplyCount } = props;
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    api.blog.reply.getReplies.useInfiniteQuery(
      {
        limit: Globals.replyFetchLimit,
        blogId: group.root.id,
        parentId: group.path.at(-1),
      },
      {
        // enabled: useSession().status !== 'loading' || !Globals.prioritiseSelfReplies,
        trpc: { abortOnUnmount: true },
        staleTime: process.env.NODE_ENV === 'development' ? 0 : undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );
  const replies = useMemo(() => data?.pages?.flatMap((p) => p.data), [data]);
  const canPostReply = Permission.useGlobalPermission('blog.comment.post');
  const deleteDialog = useDeleteDialog({
    title: useMessage('general.delete', getGlobalMessage('blog.reply.name')),
    endpoint: api.blog.reply.deleteReply.useMutation(),
    content: deleteDialogContent,
    width: 'md',
  });
  const repliesShown = replies?.length ?? 0;
  return (
    <Stack css={style.blogReplyGroup} spacing={'lg'}>
      {group.path.length < Globals.maxReplyDepth &&
        (!group.parent || canPostReply) && (
          <BlogReplyField group={group} ref={fieldRef} />
        )}
      {(repliesShown !== 0 || (estimatedReplyCount ?? 0) > 0) && (
        <Stack as={'ol'} aria-label={getGlobalMessage('translation.replies')}>
          {replies?.map((reply) => (
            <li key={reply.id}>
              <BlogReplyCard
                reply={reply}
                parent={group}
                onDelete={deleteDialog}
              />
            </li>
          ))}
          {(isLoading || isFetchingNextPage) && (
            <ReplySkeletonGroup
              totalCount={estimatedReplyCount ?? 0}
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
