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
import { TRPCClientError } from '@trpc/client';
import { useSession } from 'next-auth/react';
import { Button, Icon, Skeleton, Stack } from 'next-ui';
import { multiRef } from 'next-ui/src/utils/mutliRef';
import {
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { MdWarning } from 'react-icons/md';

export type BlogCommentGroupProps = {
  group: CommentGroupNode;
  replyCount: number;
  disabled?: boolean;
  fieldRef?: RefObject<BlogReplyFieldRef>;
  /** Function that is called in order to refetch the blog data. */
};

export default function BlogReplyGroup(props: BlogCommentGroupProps) {
  const { group, fieldRef, replyCount, disabled } = props;
  const blogPost = useBlogPost();
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
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
  const session = useSession();
  const internalFieldRef = useRef<BlogReplyFieldRef>(null);
  const replies = useMemo(() => data?.pages?.flatMap((p) => p.data), [data]);
  const canPostReply = Permission.useGlobalPermission('blog.comment.post');
  const ownReply = replies?.find((r) => r.authorId === session.data?.user?.id);
  const hasReplied = ownReply != null;
  const deleteEndpoint = api.blog.reply.deleteReply.useMutation();
  const notifyReplyParent = useReplyParentNotify(group, queryParams);
  const notifyBlogParent = useBlogParentNotify();
  const deleteDialog = useDeleteDialog({
    title: useMessage('general.delete', getGlobalMessage('blog.reply.name')),
    endpoint: deleteEndpoint,
    content: deleteDialogContent,
    width: 'md',
    onSuccess: ({ deleted, root }) => {
      refetch({ type: 'all' }).then(() => {
        if (queryParams.parentId) notifyReplyParent((par) => --par.replyCount);
        if (root.type !== 'blog') notifyBlogParent(root.node, -deleted, -1);
      });
    },
  });
  const repliesShown = replies?.length ?? 0;
  const isLoadingData = isRefetching || isLoading || deleteEndpoint.isLoading;
  const apiContext = api.useContext();
  return (
    <Stack css={style.blogReplyGroup} spacing={'lg'}>
      {group.path.length < Globals.maxReplyDepth &&
        (!group.parent || canPostReply) && (
          <BlogReplyField
            group={group}
            hasReplied={hasReplied}
            onError={(error) => {
              // <==> REFETCH EXISTING DATA ON ERROR <==>
              if (!(error instanceof TRPCClientError)) return;
              const code = error.data.code as unknown;
              const promises: any[] = [];
              // We refetch the blog if either NOT_FOUND or FORBIDDEN
              if (code === 'NOT_FOUND' || code === 'FORBIDDEN')
                promises.push(blogPost.refresh());
              // We refetch replies only if NOT_FOUND was returned
              if (code === 'NOT_FOUND' && queryParams.parentId)
                promises.push(
                  apiContext.blog.reply.getReplies.refetch({
                    ...queryParams,
                    parentId: group.path.at(-2),
                  })
                );
              Promise.allSettled(promises).catch(console.error);
            }}
            ref={multiRef(fieldRef, internalFieldRef)}
            field={{ disabled: disabled || isLoadingData }}
            isLoading={isLoadingData}
            onAdded={(data) => {
              // // Obsolete due to the `LockedField` implementation.
              // const field = internalFieldRef?.current?.textField?.field;
              // if (field) { field.blur(); field.value = ''; }
              refetch().then(() => {
                if (queryParams.parentId)
                  notifyReplyParent((par) => ++par.replyCount);
                notifyBlogParent(data, 1 /* added one reply */);
              });
            }}
          />
        )}
      {(repliesShown !== 0 || replyCount !== 0) && (
        <Stack as={'ol'} aria-label={getGlobalMessage('translation.replies')}>
          {replies?.map((reply) => (
            <li key={reply.id}>
              <BlogReplyCard
                reply={reply}
                parent={group}
                disabled={isLoadingData || disabled}
                canReply={canPostReply}
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

// <=========================================>
//          REPLY HOOKS AND DIALOGS
// <=========================================>

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

/**
 * Hook that returns a callback that can be called in order to notify the (Reply!) parent
 * about child-based updates. The returned callback takes another action callback with an
 * argument of type `BlogReplyData`, which is the actual parent.
 * In order to perform updates on the parent, the parent has to be mutated within the
 * action callback. The modified data is then set, to trigger a re-render.
 * Note: the parent cannot be a blog post!
 *
 * @param group the group of the reply which' parent is targeted
 * @param queryParams the query parameters used to fetch the reply (not the parent!)
 */
function useReplyParentNotify(
  group: CommentGroupNode,
  queryParams: {
    blogId: string;
    parentId: string | undefined | null;
    limit: number;
  }
) {
  const apiContext = api.useContext();
  const getReplies = apiContext.blog.reply.getReplies;
  const queryParamsRef = useRef(queryParams);
  // prettier-ignore
  useEffect(() => { queryParamsRef.current = queryParams; });
  return useCallback(
    (action: (reply: BlogReplyData) => any) => {
      const queryParams = queryParamsRef.current;
      const newQueryParams = { ...queryParams, parentId: group.path.at(-2) };
      const newData = getReplies.getInfiniteData(newQueryParams);
      newData?.pages
        ?.map((page) => page.data.find((v) => v.id === queryParams.parentId))
        .filter((v) => v != null)
        .forEach((v) => action(v!));
      getReplies.setInfiniteData(newQueryParams, newData);
    },
    [getReplies, group.path]
  );
}

function useBlogParentNotify() {
  const blogPost = useBlogPost();
  return (
    root: Partial<Pick<BlogReplyData, 'parentId'>>,
    totalIncrement: number,
    localIncrement: number = totalIncrement
  ) => {
    blogPost.data.set((state) => ({
      ...state,
      totalReplyCount: state.totalReplyCount + totalIncrement,
      replyCount: root.parentId
        ? state.replyCount + localIncrement
        : state.replyCount,
    }));
  };
}

// <=========================================>
//         REPLY SKELETON COMPONENTS
// <=========================================>

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
