/** @jsxImportSource @emotion/react */
import { BlogReplyCard } from '../BlogReplyCard';
import * as style from './BlogReplyGroup.style';
import { Permission } from '@/modules/auth/utils/permission';
import { BlogReplyField } from '@/modules/blogs/components/BlogReplyField';
import type { BlogReplyFieldRef } from '@/modules/blogs/components/BlogReplyField/BlogReplyField';
import type { CommentGroupNode } from '@/modules/blogs/groupSchema';
import { api } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { getGlobalMessage } from '@/utils/message';
import { useDeleteDialog } from '@/utils/pages/infinite/infiniteDialog';
import { Button, Stack } from 'next-ui';
import { RefObject, useMemo } from 'react';

export type BlogCommentGroupProps = {
  group: CommentGroupNode;
  fieldRef?: RefObject<BlogReplyFieldRef>;
};

export default function BlogReplyGroup(props: BlogCommentGroupProps) {
  const { group, fieldRef } = props;
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    api.blog.reply.getReplies.useInfiniteQuery(
      {
        limit: Globals.replyFetchLimit,
        blogId: group.root.id,
        parentId: group.path.at(-1),
      },
      {
        trpc: { abortOnUnmount: true },
        staleTime: Infinity,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );
  const array = useMemo(() => {
    return data?.pages?.flatMap((p) => p.data);
  }, [data]);
  const canPostReply = Permission.useGlobalPermission('blog.comment.post');
  const deleteDialog = useDeleteDialog({
    title: 'Delete reply',
    width: 'sm',
    endpoint: api.blog.reply.deleteReply.useMutation(),
  });
  return (
    <Stack css={style.blogReplyGroup} spacing={'lg'}>
      {group.path.length < Globals.maxReplyDepth &&
        (!group.parent || canPostReply) && (
          <BlogReplyField group={group} ref={fieldRef} />
        )}
      <Stack as={'ol'} aria-label={getGlobalMessage('translation.replies')}>
        {array?.map((reply) => (
          <li key={reply.id}>
            <BlogReplyCard
              reply={reply}
              parent={group}
              onDelete={deleteDialog}
            />
          </li>
        ))}
        {hasNextPage && (
          <Button.Text
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {getGlobalMessage('general.load_more')}
          </Button.Text>
        )}
      </Stack>
    </Stack>
  );
}
