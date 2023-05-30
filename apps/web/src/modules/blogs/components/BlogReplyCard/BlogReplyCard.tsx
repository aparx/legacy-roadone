/** @jsxImportSource @emotion/react */
import { BlogReplyCardConfig as config } from './BlogReplyCard.config';
import * as style from './BlogReplyCard.style';
import { Avatar } from '@/components';
import { Permission } from '@/modules/auth/utils/permission';
import { BlogReplyData } from '@/modules/blogs/blogReply';
import { BlogReplyFieldRef } from '@/modules/blogs/components/BlogReplyField/BlogReplyField';
import { BlogReplyGroup } from '@/modules/blogs/components/BlogReplyGroup';
import { CommentGroupNode } from '@/modules/blogs/groupSchema';
import { Globals } from '@/utils/global/globals';
import { useRelativeTime } from '@/utils/hooks/useRelativeTime';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { useRegreplURL } from '@/utils/urlReplace';
import { useTheme } from '@emotion/react';
import { useSession } from 'next-auth/react';
import {
  Button,
  propMerge,
  Stack,
  StyleableProp,
  Text,
  UI,
  useStyleableMerge,
} from 'next-ui';
import { createStackProps } from 'next-ui/src/components/Stack/Stack';
import { useEffect, useId, useRef, useState } from 'react';
import { MdCheck, MdDelete, MdExpandLess, MdExpandMore } from 'react-icons/md';

import useGlobalPermission = Permission.useGlobalPermission;

export type BlogReplyProps = {
  reply: BlogReplyData;
  disabled?: boolean;
  /**
   * If the user can reply.
   * The necessary authorization is done automatically already. Thus, this field is
   * independent of the permission level that the current session has.
   */
  canReply?: boolean;
} & (
  | { visualOnly: true; parent?: undefined }
  | { visualOnly?: false | undefined; parent: CommentGroupNode }
) &
  Partial<Pick<InfiniteItemEvents<BlogReplyData>, 'onDelete'>> &
  StyleableProp;

export default function BlogReplyCard(props: BlogReplyProps) {
  const { reply, visualOnly, onDelete, parent, disabled, canReply, ...rest } =
    props;
  const labeledBy = useId();
  const session = useSession();
  const triggerFocus = useRef(false);
  const [showReplies, setShowReplies] = useState(false);
  const isOwner = reply.authorId === session?.data?.user?.id;
  // prettier-ignore
  const canPostReply =
    useGlobalPermission('blog.comment.post') &&
    parent && 1 + parent.path.length < Globals.maxReplyDepth;
  const canManipulateReply =
    useGlobalPermission('blog.reply.ownAll') || isOwner;
  const fieldRef = useRef<BlogReplyFieldRef>(null);

  const showReplyButton = canPostReply && !visualOnly;
  const showExpandButton = reply.replyCount > 0 && !visualOnly;
  const showDeleteButton = canManipulateReply && !visualOnly;

  const t = useTheme();

  useEffect(() => {
    // on-rerender try and focus the now (eventual) visible field
    if (showReplies && triggerFocus.current)
      fieldRef.current?.textField?.focus();
    triggerFocus.current = false;
  }, [showReplies]);
  return (
    <Stack as={'article'} aria-labelledby={labeledBy} spacing={0}>
      <Stack
        direction={'row'}
        {...propMerge({ css: style.blogReply }, useStyleableMerge(rest))}
        sd={{
          padding: 'md',
          roundness: UI.generalRoundness / 2,
        }}
      >
        <div style={{ marginTop: '2px' }}>
          <Avatar
            user={reply.author}
            size={config.avatarSize}
            name={getGlobalMessage('translation.profilePicture')}
            aria-hidden={true}
          />
        </div>
        <Stack spacing={0.25}>
          <div>
            <Stack as={'header'} direction={'row'} wrap hSpacing={1}>
              {reply.author?.verified && reply.author?.name ? (
                <Text.Title
                  size={'sm'}
                  id={labeledBy}
                  take={{ fontWeight: 'strong' }}
                  sd={{
                    padding: 'sm',
                    background: (t) => t.sys.color.surface[4],
                    color: (t) => t.sys.color.scheme.onSurface,
                  }}
                  {...createStackProps(t, { direction: 'row', spacing: 'md' })}
                >
                  {reply.author?.name}
                  <MdCheck />
                </Text.Title>
              ) : (
                <Text.Title
                  size={'sm'}
                  id={labeledBy}
                  take={{ fontWeight: 'strong' }}
                ></Text.Title>
              )}

              <Text.Label
                as={'time'}
                size={'lg'}
                emphasis={'medium'}
                dateTime={reply.createdAt.toISOString()}
                take={{ fontWeight: 'regular' }}
              >
                {useRelativeTime(reply.createdAt)}
              </Text.Label>
            </Stack>
            <Text.Body size={'md'} emphasis={'medium'}>
              <>{useRegreplURL(reply.content)}</>
            </Text.Body>
          </div>
          <Stack as={'footer'} direction={'row'} spacing={1} vAlign wrap>
            {showReplyButton && (
              <Button.Text
                onClick={() => {
                  triggerFocus.current = true;
                  setShowReplies(true);
                  fieldRef.current?.textField?.focus();
                }}
                disabled={disabled || !canReply}
                take={{ hPaddingMode: 'oof' }}
                sd={{ emphasis: disabled || !canReply ? 'disabled' : 'medium' }}
              >
                {getGlobalMessage('blog.reply.nameAddSingle')}
              </Button.Text>
            )}
            {showExpandButton && (
              <Button.Text
                tight
                disabled={disabled}
                leading={showReplies ? <MdExpandLess /> : <MdExpandMore />}
                onClick={() => setShowReplies((s) => !s)}
                style={{ padding: 0 }}
                take={{ hPaddingMode: !showReplyButton && 'oof' }}
                sd={{ emphasis: disabled ? 'disabled' : 'medium' }}
              >
                {showReplies
                  ? getGlobalMessage('blog.reply.multiHide')
                  : getGlobalMessage('blog.reply.multiShow')}
              </Button.Text>
            )}
            {showDeleteButton && (
              <Button.Text
                tight
                disabled={disabled}
                leading={<MdDelete />}
                onClick={() => onDelete?.({ item: reply })}
                sd={{
                  color: (t) => t.sys.color.scheme.error,
                  emphasis: 'medium',
                }}
                take={{
                  hPaddingMode: !showReplyButton && !showExpandButton && 'oof',
                }}
              >
                {getGlobalMessage('translation.delete')}
              </Button.Text>
            )}
          </Stack>
        </Stack>
      </Stack>
      {showReplies && parent && (
        <Stack
          as={'section'}
          sd={{ marginLeft: 'md', paddingLeft: 'lg' }}
          css={style.nestedRepliesStack}
        >
          <BlogReplyGroup
            fieldRef={fieldRef}
            replyCount={reply.replyCount}
            disabled={disabled}
            group={{
              root: parent.root,
              parent,
              path: [...parent.path, reply.id],
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
