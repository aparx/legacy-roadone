/** @jsxImportSource @emotion/react */
import * as style from './BlogReplyField.style';
import { useToastHandle } from '@/handles';
import { logIn } from '@/modules/auth/utils/logInOut';
import {
  blogReplyContentSchema,
  BlogReplyData,
} from '@/modules/blogs/blogReply';
import { BlogReplyCardConfig } from '@/modules/blogs/components/BlogReplyCard';
import { CommentGroupNode } from '@/modules/blogs/groupSchema';
import { api } from '@/utils/api';
import { formatMessage } from '@/utils/format';
import { getGlobalMessage } from '@/utils/message';
import { useAddErrorToast } from '@/utils/toast';
import { useTheme } from '@emotion/react';
import { useSession } from 'next-auth/react';
import {
  Button,
  Icon,
  MultiplierValueInput,
  propMerge,
  PropsWithStyleable,
  Spinner,
  Stack,
  TextField,
  useStyleableMerge,
} from 'next-ui';
import RawForm from 'next-ui/src/components/RawForm/RawForm';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import {
  useDataTextProps,
  useFontData,
} from 'next-ui/src/components/Text/Text';
import { TextFieldRef } from 'next-ui/src/components/TextField/TextField';
import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  useImperativeHandle,
  useRef,
} from 'react';
import { MdLock, MdLogin, MdSend } from 'react-icons/md';
import { TypescalePinpoint } from 'theme-core';

export type InternalReplyFieldProps = {
  /** Group of where the comment field is supposed to append comments to. */
  group: CommentGroupNode;
};

export type BlogReplyFieldProps = InternalReplyFieldProps & {
  shell?: PropsWithStyleable<HTMLAttributes<HTMLDivElement>>;
  field?: PropsWithStyleable<InputHTMLAttributes<HTMLInputElement>>;
  hasReplied?: boolean;
  isLoading?: boolean;
  onAdded?: (data: BlogReplyData) => any;
  onError?: (error: any) => any;
};

export type BlogReplyFieldRef = {
  textField: TextFieldRef | null;
};

export const BlogReplyField = forwardRef<
  BlogReplyFieldRef,
  BlogReplyFieldProps
>(function BlogReplyFieldRenderer(props, ref) {
  const { group, onAdded, onError, isLoading } = props;
  const fieldRef = useRef<TextFieldRef>(null);
  useImperativeHandle(ref, () => ({ textField: fieldRef.current }));
  const addToast = useToastHandle((s) => s.add);
  const addErrorToast = useAddErrorToast();
  const endpoint = api.blog.reply.addReply.useMutation({
    trpc: { abortOnUnmount: true },
    onSuccess: (data) => {
      onAdded?.(data);
      addToast({
        type: 'success',
        title: formatMessage(
          getGlobalMessage('general.added'),
          getGlobalMessage('blog.reply.name')
        ),
      });
    },
    onError: (e) => {
      onError?.(e);
      addErrorToast(e);
    },
  });
  return (
    <RawForm
      schema={blogReplyContentSchema}
      form={() => (
        <ReplyForm
          {...props}
          ref={fieldRef}
          isLoading={isLoading || endpoint.isLoading}
        />
      )}
      onSubmit={(data) =>
        endpoint.mutate({
          blogId: group.root.id,
          parentId: group.path.at(-1),
          content: data.content,
        })
      }
    />
  );
});

export default BlogReplyField;

const ReplyForm = forwardRef<TextFieldRef, BlogReplyFieldProps>(
  function ReplyFormRenderer(
    { group, shell, field, isLoading, hasReplied },
    ref
  ) {
    const { status } = useSession();
    const notAuthed = status === 'unauthenticated';
    const rawForm = useRawForm();
    isLoading ||= status === 'loading';
    return (
      <div {...useStyleableMerge(shell ?? {})}>
        {notAuthed || hasReplied ? (
          <LockedField
            type={notAuthed ? 'auth' : 'other'}
            message={
              notAuthed
                ? getGlobalMessage('general.signInToReply')
                : getGlobalMessage('blog.reply.already_replied')
            }
          />
        ) : (
          <TextField
            ref={ref}
            name={'content'}
            placeholder={`${formatMessage(
              getGlobalMessage('general.add'),
              getGlobalMessage('blog.reply.alternate')
            )}...`}
            tight
            field={{ autoComplete: 'off' }}
            hookform={rawForm}
            tailing={
              isLoading ? (
                <Spinner size={20} sd={{ marginH: 'md' }} />
              ) : (
                <Button.Text
                  type={'submit'}
                  aria-label={getGlobalMessage('translation.send')}
                  tight
                  take={{ vPaddingMode: 'oof' }}
                  icon={<MdSend />}
                  disabled={status === 'loading'}
                />
              )
            }
            required
            {...propMerge({ css: style.replyTextField }, field)}
            disabled={field?.disabled || isLoading}
          />
        )}
      </div>
    );
  }
);

type LockedFieldProps = {
  type: 'auth' | 'other';
  message: string;
};

function LockedField(props: LockedFieldProps) {
  const { type, message } = props;
  const font = { role: 'body', size: 'md' } satisfies TypescalePinpoint;
  const fontData = useFontData(font);
  const theme = useTheme();
  const isAuth = type === 'auth';
  const paddingH: MultiplierValueInput<'spacing'> = 'sm';
  return (
    <Stack
      sd={{ paddingH, paddingV: isAuth ? 'sm' : 'md' }}
      direction={'row'}
      {...propMerge(useDataTextProps({ fontData }), {
        css: style.loginField(useTheme(), fontData),
        style: {
          userSelect: 'none',
          cursor: isAuth ? 'pointer' : undefined,
        } satisfies CSSProperties,
      })}
      onClick={isAuth ? logIn : undefined}
      hAlign={'space-between'}
      vAlign
      aria-hidden={!isAuth}
    >
      <Stack
        direction={'row'}
        {...useDataTextProps({ fontData, emphasis: isAuth ? 'medium' : 'low' })}
      >
        <Icon
          aria-hidden
          icon={<MdLock />}
          fontData={fontData}
          style={{
            marginLeft:
              (theme.rt.multipliers.spacing('md') ?? 0) -
              (theme.rt.multipliers.spacing(paddingH) ?? 0),
            width: BlogReplyCardConfig.avatarSize,
          }}
        />
        <span>{message}</span>
      </Stack>
      {isAuth && (
        <Button.Primary size={'sm'} leading={<MdLogin />} onClick={logIn}>
          {getGlobalMessage('translation.signIn')}
        </Button.Primary>
      )}
    </Stack>
  );
}
