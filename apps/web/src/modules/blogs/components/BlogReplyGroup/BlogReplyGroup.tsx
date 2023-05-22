/** @jsxImportSource @emotion/react */
import { BlogReplyCard } from '../BlogReplyCard';
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
import { Button, Icon, Stack } from 'next-ui';
import { RefObject, useMemo } from 'react';
import { MdWarning } from 'react-icons/md';

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
  const deleteDialog = useDeleteDialog<any, BlogReplyData>({
    title: useMessage('general.delete', getGlobalMessage('blog.reply.name')),
    endpoint: api.blog.reply.deleteReply.useMutation(),
    content: deleteDialogContent,
    width: 'md',
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
        sd={{ padding: 'md', background: (t) => t.sys.color.surface[2] }}
        visualOnly
        reply={item}
        onDelete={() => {}}
      />
    </Stack>
  );
};
