/** @jsxImportSource @emotion/react */
import * as style from './BlogPostCard.style';
import { useToastHandle } from '@/handles';
import { Permission } from '@/modules/auth/utils/permission';
import type { BlogPostData } from '@/modules/blogs/blogPost';
import BlogReplyGroup from '@/modules/blogs/components/BlogReplyGroup/BlogReplyGroup';
import {
  BlogPostContext,
  BlogPostProvider,
  useBlogPost,
} from '@/modules/blogs/context/blogPostContext';
import { useRelativeTime } from '@/utils/hooks/useRelativeTime';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { Button, Card, Stack } from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import { useRouter } from 'next/router';
import { useId } from 'react';
import {
  MdComment,
  MdCommentsDisabled,
  MdDelete,
  MdEdit,
  MdOutlineModeComment,
  MdShare,
} from 'react-icons/md';

import useGlobalPermission = Permission.useGlobalPermission;

export type BlogPostCardProps = {
  context: BlogPostContext;
} & InfiniteItemEvents<BlogPostData>;

export default function BlogPostCard(props: BlogPostCardProps) {
  const { context } = props;
  const { data } = context;
  const labelledBy = useId();
  return (
    <BlogPostProvider value={context}>
      <article aria-labelledby={labelledBy} id={data.state.id}>
        <Card
          css={style.blogPostCard}
          keepPadding
          style={
            context.showReplies.state
              ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
              : undefined
          }
        >
          <Card.Header>
            <Card.Header.Subtitle>
              {useRelativeTime(data.state.createdAt)}
            </Card.Header.Subtitle>
            <Card.Header.Title id={labelledBy}>
              {data.state.title}
            </Card.Header.Title>
          </Card.Header>
          <Card.Content
            dangerouslySetInnerHTML={{
              __html: data.state.htmlContent ?? data.state.content,
            }}
          />
          <BlogPostFooter {...props} />
        </Card>
        {context.showReplies.state && !data.state.repliesDisabled && (
          <BlogPostReplies />
        )}
      </article>
    </BlogPostProvider>
  );
}

// <================================>
//        BLOG POST CHILDREN
// <================================>

function BlogPostFooter(props: Omit<BlogPostCardProps, 'context'>) {
  const { onEdit, onDelete } = props;
  const {
    data: { state: blog },
    showReplies,
  } = useBlogPost();
  const isDisabled = blog.repliesDisabled;
  const showEdit = useGlobalPermission('blog.edit');
  const showDelete = useGlobalPermission('blog.delete');
  const router = useRouter();
  const addToast = useToastHandle((s) => s.add);
  const url = `https://${process.env.NEXT_PUBLIC_SELF_URL}${router.asPath}#${blog.id}`;
  return (
    <Card.Footer
      {...useStackProps({ direction: 'row', vAlign: true, wrap: true })}
    >
      {/* TODO possibly replace with a like-button (with timeouts) */}
      <Button.Secondary
        tight
        icon={<MdShare />}
        aria-label={getGlobalMessage('translation.share')}
        onClick={() => {
          if (navigator.canShare?.({ url })) navigator.share?.({ url });
          else if (!navigator.clipboard?.writeText)
            addToast({
              type: 'error',
              message: 'Dein Gerät unterstützt dies leider nicht.',
            });
          else
            navigator.clipboard.writeText(url).then(() =>
              addToast({
                type: 'success',
                message: getGlobalMessage('general.clipboard_url_success'),
              })
            );
        }}
      />
      {showEdit && (
        <Button.Secondary
          tight
          icon={<MdEdit />}
          aria-label={getGlobalMessage('translation.edit')}
          onClick={() => onEdit({ item: blog })}
        />
      )}
      {showDelete && (
        <Button.Secondary
          tight
          icon={<MdDelete />}
          aria-label={getGlobalMessage('translation.delete')}
          onClick={() => onDelete({ item: blog })}
        />
      )}
      <Button.Secondary
        leading={
          isDisabled ? (
            <MdCommentsDisabled />
          ) : showReplies.state ? (
            <MdOutlineModeComment />
          ) : (
            <MdComment />
          )
        }
        disabled={isDisabled}
        aria-label={getGlobalMessage(
          showReplies.state ? 'blog.reply.multiHide' : 'blog.reply.multiShow'
        )}
        onClick={showReplies.toggle}
      >
        {blog.totalReplyCount !== 0 && `${blog.totalReplyCount} `}
        {getGlobalMessage('translation.comments')}
      </Button.Secondary>
    </Card.Footer>
  );
}

function BlogPostReplies() {
  const { data } = useBlogPost();
  return (
    <Stack
      as={'section'}
      aria-label={getGlobalMessage('translation.comments')}
      sd={{
        padding: 'lg',
        background: (t) => t.sys.color.surface[2],
        roundness: 'md',
      }}
      style={{
        borderTopLeftRadius: 'unset',
        borderTopRightRadius: 'unset',
      }}
    >
      <BlogReplyGroup
        group={{ root: data.state, path: [] }}
        replyCount={data.state.replyCount}
      />
    </Stack>
  );
}
