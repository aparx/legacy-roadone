/** @jsxImportSource @emotion/react */
import { BlogThreadGroup } from '../BlogThreadGroup';
import * as style from './BlogPostCard.style';
import { Permission } from '@/modules/auth/utils/permission';
import { ProcessedBlogPostModel } from '@/modules/blog/blog';
import {
  BlogPostContext,
  BlogPostContextProvider,
  useBlogPostContext,
} from '@/modules/blog/context/blogPostContext';
import { useRelativeTime } from '@/utils/hooks/useRelativeTime';
import { useLocalToggle } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { Button, Card, PropsWithStyleable, useStyleableMerge } from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import { HTMLAttributes, useId } from 'react';
import {
  MdComment,
  MdCommentsDisabled,
  MdDeleteForever,
  MdEdit,
  MdOutlineModeComment,
  MdShare,
} from 'react-icons/md';
import { ObjectConjunction } from 'shared-utils';

import useGlobalPermission = Permission.useGlobalPermission;

export type InternalBlogPostCardProps = Omit<BlogPostContext, 'showReplies'> & {
  autoShowReply?: boolean;
};

export type BlogPostCardProps = ObjectConjunction<
  PropsWithStyleable<HTMLAttributes<HTMLElement> & InternalBlogPostCardProps>,
  InfiniteItemEvents<ProcessedBlogPostModel>
>;

export default function BlogPostCard(props: BlogPostCardProps) {
  const {
    blogPost,
    isLoading,
    isFetching,
    onEdit,
    onDelete,
    autoShowReply,
    ...rest
  } = props;
  const labelledBy = useId();
  const commentSectionId = useId();
  const showReplies = useLocalToggle(autoShowReply);
  const borderBottomRadius = showReplies.state ? 0 : undefined;
  return (
    <BlogPostContextProvider
      value={{ blogPost, isLoading, isFetching, showReplies }}
    >
      <article aria-labelledby={labelledBy} {...useStyleableMerge(rest)}>
        <Card
          keepPadding
          style={{
            borderBottomLeftRadius: borderBottomRadius,
            borderBottomRightRadius: borderBottomRadius,
          }}
        >
          <Card.Header>
            <Card.Header.Subtitle emphasis={'low'}>
              <time dateTime={blogPost.createdAt.toISOString()}>
                {useRelativeTime(blogPost.createdAt)}
              </time>
            </Card.Header.Subtitle>
            <Card.Header.Title id={labelledBy}>
              {blogPost.title}
            </Card.Header.Title>
          </Card.Header>
          <Card.Content
            dangerouslySetInnerHTML={{
              __html: blogPost.htmlContent ?? blogPost.content,
            }}
          />
          <BlogPostFooter
            commentSectionId={commentSectionId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Card>
        {showReplies.state && (
          <BlogPostComments commentSectionId={commentSectionId} />
        )}
      </article>
    </BlogPostContextProvider>
  );
}

/** Properties used internally by the blog post, only shared locally. */
type InternalSharedProps = {
  commentSectionId: string;
};

function BlogPostFooter({
  commentSectionId,
  onEdit,
  onDelete,
}: InternalSharedProps & Pick<BlogPostCardProps, 'onEdit' | 'onDelete'>) {
  const { blogPost, showReplies } = useBlogPostContext();
  const { totalCommentCount, commentsDisabled } = blogPost;
  const canEdit = useGlobalPermission('blog.edit');
  const canDelete = useGlobalPermission('blog.delete');
  return (
    <Card.Footer
      {...useStackProps({
        direction: 'row',
        wrap: true,
        vAlign: true,
      })}
    >
      <Button.Secondary
        tight
        icon={<MdShare />}
        aria-label={getGlobalMessage('translation.share')}
      />
      {canEdit && (
        <Button.Secondary
          tight
          icon={<MdEdit />}
          onClick={() => onEdit({ item: blogPost })}
          aria-label={getGlobalMessage(
            'general.edit',
            getGlobalMessage('blog.post.name')
          )}
        />
      )}
      {canDelete && (
        <Button.Secondary
          tight
          icon={<MdDeleteForever />}
          onClick={() => onDelete({ item: blogPost })}
          aria-label={getGlobalMessage(
            'general.delete',
            getGlobalMessage('blog.post.name')
          )}
        />
      )}
      <Button.Secondary
        onClick={showReplies.toggle}
        disabled={commentsDisabled}
        leading={
          commentsDisabled ? (
            <MdCommentsDisabled />
          ) : showReplies.state ? (
            <MdOutlineModeComment />
          ) : (
            <MdComment />
          )
        }
        aria-expanded={showReplies.state}
        aria-controls={commentSectionId}
        aria-label={getGlobalMessage(
          showReplies.state
            ? 'blog.comment.multiHide'
            : 'blog.comment.multiShow'
        )}
      >
        {totalCommentCount ? `${totalCommentCount} ` : null}
        {getGlobalMessage('translation.comments')}
      </Button.Secondary>
    </Card.Footer>
  );
}

function BlogPostComments({ commentSectionId }: InternalSharedProps) {
  const { blogPost } = useBlogPostContext();
  return (
    <section
      css={style.commentSection}
      aria-label={getGlobalMessage('translation.comments')}
      id={commentSectionId}
    >
      <BlogThreadGroup
        blog={blogPost}
        approximation={blogPost.commentCount ?? 0}
        group={{ type: 'comment', blog: blogPost.id }}
      />
    </section>
  );
}
