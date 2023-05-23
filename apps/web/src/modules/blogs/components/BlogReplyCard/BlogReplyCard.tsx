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
import { useEffect, useId, useRef, useState } from 'react';
import { MdDelete, MdExpandLess, MdExpandMore } from 'react-icons/md';

import useGlobalPermission = Permission.useGlobalPermission;

export type BlogReplyProps = { reply: BlogReplyData } & (
  | { visualOnly: true; parent?: undefined }
  | { visualOnly?: false | undefined; parent: CommentGroupNode }
) &
  Partial<Pick<InfiniteItemEvents<BlogReplyData>, 'onDelete'>> &
  StyleableProp;

export default function BlogReplyCard(props: BlogReplyProps) {
  const { reply, visualOnly, onDelete, parent, ...rest } = props;
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
  useEffect(() => {
    // on-rerender try and focus the now (eventual) visible field
    if (showReplies && triggerFocus.current)
      fieldRef.current?.textField?.focus();
    triggerFocus.current = false;
  }, [showReplies]);
  return (
    <Stack as={'article'} aria-labelledby={labeledBy}>
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
              <Text.Title
                size={'sm'}
                id={labeledBy}
                take={{ fontWeight: 'strong' }}
              >
                {/* TODO replace "[[deleted]]" with something else */}
                {reply.author?.name || '[[deleted]]'}
              </Text.Title>
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
              {reply.content}
            </Text.Body>
          </div>
          <Stack as={'footer'} direction={'row'} spacing={1} vAlign wrap>
            {canPostReply && !visualOnly && (
              <Button.Text
                onClick={() => {
                  triggerFocus.current = true;
                  setShowReplies(true);
                  fieldRef.current?.textField?.focus();
                }}
                take={{ hPaddingMode: 'oof' }}
                sd={{ emphasis: 'medium' }}
              >
                Antworten
              </Button.Text>
            )}
            {reply.replyCount !== 0 && !visualOnly && (
              <Button.Text
                tight
                leading={showReplies ? <MdExpandLess /> : <MdExpandMore />}
                onClick={() => setShowReplies((s) => !s)}
                style={{ padding: 0 }}
                take={{ hPaddingMode: !canPostReply && 'oof' }}
                sd={{ emphasis: 'medium' }}
              >
                {showReplies
                  ? getGlobalMessage('blog.reply.multiHide')
                  : getGlobalMessage('blog.reply.multiShow')}
              </Button.Text>
            )}
            {canManipulateReply && !visualOnly && (
              <Button.Text
                tight
                leading={<MdDelete />}
                onClick={() => onDelete?.({ item: reply })}
                sd={{
                  color: (t) => t.sys.color.scheme.error,
                  emphasis: 'medium',
                }}
                take={{
                  hPaddingMode:
                    reply.replyCount === 0 && !canPostReply && 'oof',
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
