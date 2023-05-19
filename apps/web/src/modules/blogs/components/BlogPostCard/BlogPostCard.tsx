/** @jsxImportSource @emotion/react */
import * as style from './BlogPostCard.style';
import { Permission } from '@/modules/auth/utils/permission';
import type { BlogData, BlogProcessedData } from '@/modules/schemas/blog';
import { ToggleState, useLocalToggle } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import dayjs from 'dayjs';
import { Button, Card } from 'next-ui';
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
  blog: BlogProcessedData;
} & InfiniteItemEvents<BlogData>;

export default function BlogPostCard(props: BlogPostCardProps) {
  const { blog } = props;
  const showComments = useLocalToggle();
  const labelledBy = useId();
  return (
    <article aria-labelledby={labelledBy}>
      <Card
        css={style.blogPostCard}
        keepPadding
        style={
          showComments.state
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : undefined
        }
      >
        <Card.Header>
          <Card.Header.Subtitle>
            {dayjs(blog.createdAt).fromNow()}
          </Card.Header.Subtitle>
          <Card.Header.Title id={labelledBy}>{blog.title}</Card.Header.Title>
        </Card.Header>
        <Card.Content
          dangerouslySetInnerHTML={{ __html: blog.htmlContent ?? blog.content }}
        />
        <BlogPostFooter {...props} showComments={showComments} />
      </Card>
      {showComments.state && <BlogPostCommentTree {...props} />}
    </article>
  );
}

function BlogPostFooter(
  props: BlogPostCardProps & { showComments: ToggleState }
) {
  const { blog, onEdit, onDelete, showComments } = props;
  console.log(blog);
  const isDisabled = blog.commentsDisabled;
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
          ) : showComments.state ? (
            <MdOutlineModeComment />
          ) : (
            <MdComment />
          )
        }
        disabled={isDisabled}
        aria-label={getGlobalMessage(
          showComments.state
            ? 'aria.blog.closeComments'
            : 'aria.blog.showComments'
        )}
        onClick={showComments.toggle}
      >
        {/*  TODO FETCH COMMENTS */}
        {blog.commentCount !== 0 && `${blog.commentCount} `}
        {getGlobalMessage('translation.comments')}
      </Button.Secondary>
    </Card.Footer>
  );
}

function BlogPostCommentTree(props: BlogPostCardProps) {
  return (
    <section aria-label={getGlobalMessage('translation.comments')}>
      Comment Tree
    </section>
  );
}
