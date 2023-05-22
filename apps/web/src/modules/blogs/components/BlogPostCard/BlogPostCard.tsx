/** @jsxImportSource @emotion/react */
import * as style from './BlogPostCard.style';
import { Permission } from '@/modules/auth/utils/permission';
import type {
  BlogPostData,
  BlogPostProcessedData,
} from '@/modules/blogs/blogPost';
import BlogReplyGroup from '@/modules/blogs/components/BlogReplyGroup/BlogReplyGroup';
import { useRelativeTime } from '@/utils/hooks/useRelativeTime';
import { LocalToggle, useLocalToggle } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { Button, Card, Stack } from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
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
  blog: BlogPostProcessedData;
  replyAutoShow?: boolean;
} & InfiniteItemEvents<BlogPostData>;

export default function BlogPostCard(props: BlogPostCardProps) {
  const { blog, replyAutoShow } = props;
  const showReplies = useLocalToggle(replyAutoShow);
  const labelledBy = useId();
  return (
    <article aria-labelledby={labelledBy}>
      <Card
        css={style.blogPostCard}
        keepPadding
        style={
          showReplies.state
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : undefined
        }
      >
        <Card.Header>
          <Card.Header.Subtitle>
            {useRelativeTime(blog.createdAt)}
          </Card.Header.Subtitle>
          <Card.Header.Title id={labelledBy}>{blog.title}</Card.Header.Title>
        </Card.Header>
        <Card.Content
          dangerouslySetInnerHTML={{ __html: blog.htmlContent ?? blog.content }}
        />
        <BlogPostFooter {...props} showReplies={showReplies} />
      </Card>
      {showReplies.state && <BlogPostCommentTree {...props} />}
    </article>
  );
}

function BlogPostFooter(
  props: BlogPostCardProps & { showReplies: LocalToggle }
) {
  const { blog, onEdit, onDelete, showReplies } = props;
  const isDisabled = blog.repliesDisabled;
  const showEdit = useGlobalPermission('blog.edit');
  const showDelete = useGlobalPermission('blog.delete');
  return (
    <Card.Footer
      {...useStackProps({ direction: 'row', vAlign: true, wrap: true })}
    >
      <Button.Secondary
        tight
        icon={<MdShare style={{ fontSize: '125%' }} />}
        aria-label={getGlobalMessage('translation.share')}
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
        {blog.replyCount !== 0 && `${blog.replyCount} `}
        {getGlobalMessage('translation.comments')}
      </Button.Secondary>
    </Card.Footer>
  );
}

function BlogPostCommentTree(props: BlogPostCardProps) {
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
      <BlogReplyGroup group={{ root: props.blog, path: [] }} />
    </Stack>
  );
}
