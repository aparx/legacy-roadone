/** @jsxImportSource @emotion/react */
import * as style from './BlogThreadItemCard.style';
import { Avatar } from '@/components';
import { Username } from '@/components/Username';
import { BlogThreadItem, ProcessedBlogPostModel } from '@/modules/blog/blog';
import { BlogThreadGroup } from '@/modules/blog/components/BlogThreadGroup';
import { BlogThread } from '@/modules/blog/utils/thread/blogThread';
import { useMessage } from '@/utils/hooks/useMessage';
import { useRelativeTime } from '@/utils/hooks/useRelativeTime';
import { useLocalToggle } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { useRegreplURL } from '@/utils/urlReplace';
import type { StyleableProp } from 'next-ui';
import { Button, Stack, Text, useStyleableMerge } from 'next-ui';
import { TextFieldRef } from 'next-ui/src/components/TextField/TextField';
import {
  HTMLAttributes,
  RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { ObjectConjunction } from 'shared-utils';

export type InternalBlogThreadItemCardProps = {
  blog: ProcessedBlogPostModel;
  group: BlogThread;
  item: BlogThreadItem;
  /** If true, hides buttons and removes all interactivity. */
  visualOnly?: boolean;
  /** Reply field of `group` */
  groupField?: RefObject<TextFieldRef>;
} & InfiniteItemEvents<BlogThreadItem, 'delete'>;

export type BlogThreadItemCardProps = StyleableProp &
  ObjectConjunction<
    HTMLAttributes<HTMLDivElement>,
    InternalBlogThreadItemCardProps
  >;

export default function BlogThreadItemCard(props: BlogThreadItemCardProps) {
  const { blog, group, item, visualOnly, onDelete, groupField, ...rest } =
    props;
  const labelledBy = useId();
  const replyControls = useId();
  const canNestMore = item.type !== 'reply';
  const canShowMore = canNestMore && item.replyCount !== 0;
  const showReplies = useLocalToggle();
  const fieldRef = useRef<TextFieldRef>(null);
  const groupFieldRef = useRef(groupField);
  // prettier-ignore
  useEffect(() => { groupFieldRef.current = groupField });
  const openReply = useCallback(() => {
    fieldRef.current?.focus();
    const parentField = groupFieldRef.current?.current?.field;
    if (group.type === 'comment') {
      showReplies.set(true);
    } else if (parentField) {
      if (item.author?.name) parentField.value = `@${item.author.name} `;
      parentField.focus();
    }
  }, [group.type, item.author?.name, showReplies]);
  useEffect(() => {
    if (showReplies.state) fieldRef.current?.focus();
  }, [showReplies.state]);
  return (
    <Stack
      as={'article'}
      css={style.blogThreadItem}
      aria-labelledby={labelledBy}
      {...useStyleableMerge(rest)}
    >
      <Stack direction={'row'}>
        <Avatar user={item.author} />
        <Stack spacing={0}>
          <Stack as={'header'} direction={'row'}>
            <Text.Title
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
          <Stack direction={'row'} sd={{ emphasis: 'medium' }}>
            <Button.Text
              take={{ hPaddingMode: 'oof' }}
              aria-expanded={canNestMore ? showReplies.state : undefined}
              aria-controls={canNestMore ? replyControls : undefined}
              onClick={openReply}
            >
              {useMessage('blog.comment.replyAddSingle')}
            </Button.Text>
            {canShowMore && (
              <Button.Text
                leading={
                  showReplies.state ? <MdExpandLess /> : <MdExpandMore />
                }
                aria-expanded={canNestMore ? showReplies.state : undefined}
                aria-controls={canNestMore ? replyControls : undefined}
                onClick={showReplies.toggle}
              >
                {getGlobalMessage(
                  showReplies.state
                    ? 'blog.comment.multiHide'
                    : 'blog.comment.multiShow'
                )}
              </Button.Text>
            )}
          </Stack>
        </Stack>
      </Stack>
      {showReplies.state && (
        <section aria-label={getGlobalMessage('translation.replies')}>
          <BlogThreadGroup
            blog={blog}
            fieldRef={fieldRef}
            group={{ type: 'reply', blog: blog.id, parent: item.id }}
          />
        </section>
      )}
    </Stack>
  );
}
