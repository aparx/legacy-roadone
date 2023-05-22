/** @jsxImportSource @emotion/react */
import * as style from './BlogReplyField.style';
import { useToastHandle } from '@/handles';
import { blogReplyContentSchema } from '@/modules/blogs/blogReply';
import { CommentGroupNode } from '@/modules/blogs/groupSchema';
import { api } from '@/utils/api';
import { useSession } from 'next-auth/react';
import {
  propMerge,
  PropsWithStyleable,
  TextField,
  useStyleableMerge,
} from 'next-ui';
import RawForm from 'next-ui/src/components/RawForm/RawForm';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { TextFieldRef } from 'next-ui/src/components/TextField/TextField';
import {
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  useImperativeHandle,
  useRef,
} from 'react';

export type InternalReplyFieldProps = {
  /** Group of where the comment field is supposed to append comments to. */
  group: CommentGroupNode;
};

export type BlogReplyFieldProps = InternalReplyFieldProps & {
  shell?: PropsWithStyleable<HTMLAttributes<HTMLDivElement>>;
  field?: PropsWithStyleable<InputHTMLAttributes<HTMLInputElement>>;
};

export type BlogReplyFieldRef = {
  textField: TextFieldRef | null;
};

export const BlogReplyField = forwardRef<
  BlogReplyFieldRef,
  BlogReplyFieldProps
>(function BlogReplyFieldRenderer(props, ref) {
  const { group } = props;
  const fieldRef = useRef<TextFieldRef>(null);
  useImperativeHandle(ref, () => ({ textField: fieldRef.current }));
  const addToast = useToastHandle((s) => s.add);
  const endpoint = api.blog.reply.addReply.useMutation({
    trpc: { abortOnUnmount: true },
    cacheTime: Infinity,
  });
  return (
    <RawForm
      schema={blogReplyContentSchema}
      form={() => <ReplyForm {...props} ref={fieldRef} />}
      onSubmit={(data) =>
        endpoint.mutate(
          {
            blogId: group.root.id,
            parentId: group.path.at(-1),
            content: data.content,
          },
          {
            onSuccess: (comment) =>
              addToast({ type: 'success', message: JSON.stringify(comment) }),
            onError: (e) => addToast({ type: 'error', message: `${e}` }),
          }
        )
      }
    />
  );
});

export default BlogReplyField;

const ReplyForm = forwardRef<TextFieldRef, BlogReplyFieldProps>(
  function ReplyFormRenderer({ group, shell, field }, ref) {
    const { status } = useSession();
    const disabled = status !== 'authenticated';
    return (
      <div {...useStyleableMerge(shell ?? {})}>
        <TextField
          ref={ref}
          name={'content'}
          placeholder={'Kommentieren...'}
          tight
          field={{ autoComplete: 'off' }}
          hookform={useRawForm()}
          disabled={disabled}
          required
          {...propMerge({ css: style.replyTextField }, field)}
        />
        {/*{!disabled && <Button.Primary type={'submit'}>Submit</Button.Primary>}*/}
      </div>
    );
  }
);
