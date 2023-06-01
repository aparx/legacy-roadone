import * as style from './BlogThreadGroup.style';
import { useToastHandle } from '@/handles';
import {
  $blogThreadContent,
  BlogThreadContentData,
  BlogThreadItem,
  ProcessedBlogPostModel,
} from '@/modules/blog/blog';
import BlogThreadItemCard from '@/modules/blog/components/BlogThreadItemCard/BlogThreadItemCard';
import { BlogThread } from '@/modules/blog/utils/thread/blogThread';
import type { GetThreadItemsOutput } from '@/server/routers/blog/thread';
import { api } from '@/utils/api';
import { formatMessage } from '@/utils/format';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { useAddErrorToast } from '@/utils/toast';
import { Button, Spinner, Stack, TextField } from 'next-ui';
import RawForm from 'next-ui/src/components/RawForm/RawForm';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { TextFieldRef } from 'next-ui/src/components/TextField/TextField';
import { multiRef } from 'next-ui/src/utils/mutliRef';
import { Ref, useCallback, useEffect, useRef } from 'react';

/** @jsxImportSource @emotion/react */
export type InternalBlogThreadGroupProps = {
  fieldRef?: Ref<TextFieldRef>;
  blog: ProcessedBlogPostModel;
  group: BlogThread;
};

/**
 * Component that renders a `BlogThread` as a group depending on the input
 * `group` given. Data relative to `group` is fetched automatically.
 */
export default function BlogThreadGroup(props: InternalBlogThreadGroupProps) {
  const { blog, group, fieldRef } = props;
  const queryParams = { group } as const;
  const queryParamsRef = useRef(queryParams);
  // prettier-ignore
  useEffect(() => { queryParamsRef.current = queryParams });
  const { data, isFetching, isLoading, hasNextPage, refetch, fetchNextPage } =
    api.blog.threads.getThreadItems.useInfiniteQuery(queryParams, {
      // getPreviousPageParam: (lastPage) => lastPage?.thisCursor,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    });
  const items = data?.pages?.flatMap((page) => page.data) ?? [];
  const addThreadItem = () => {
    refetch({ type: 'all' });
  };
  const refetchParent = useCallback(() => {
    if (group.type === 'reply')
      return refetch<GetThreadItemsOutput>({
        refetchPage: (last) =>
          last.data.findIndex(
            (data) =>
              data.type === 'comment' &&
              data.id === group.parent &&
              data.blogId === group.blog
          ) !== -1,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.blog, (group as any).parent, group.type, refetch]);
  const ensuredFieldRef = useRef<TextFieldRef>(null);
  return (
    <Stack css={group.type !== 'comment' && style.deepWrapper}>
      <BlogThreadReplyField
        {...props}
        fieldRef={multiRef(fieldRef, ensuredFieldRef)}
        loading={isLoading || isFetching}
        onError={() => refetch({})}
        onSuccess={addThreadItem}
      />
      <Stack as={'ol'} css={style.list}>
        {items.map((item) => (
          <li key={item.id}>
            <BlogThreadItemCard
              blog={blog}
              group={group}
              item={item}
              groupField={ensuredFieldRef}
              onDelete={() => refetchParent()}
            />
          </li>
        ))}
        {hasNextPage && (
          <Button.Text
            take={{ hPaddingMode: 'oof' }}
            onClick={() => fetchNextPage()}
          >
            {formatMessage(
              getGlobalMessage('general.load_more'),
              getGlobalMessage('blog.comment.reply')
            )}
          </Button.Text>
        )}
      </Stack>
    </Stack>
  );
}

type ReplyFieldProps = InternalBlogThreadGroupProps & {
  disabled?: boolean;
  loading?: boolean;
  lockMode?: 'auth' | 'other';
  onSuccess?: (data: BlogThreadItem) => any;
  onError?: (error: any) => any;
};

function BlogThreadReplyField(props: ReplyFieldProps) {
  const { lockMode, ...rest } = props;
  return lockMode ? (
    <ReplyFieldInactive {...props} />
  ) : (
    <ReplyFieldActive {...rest} />
  );
}

function ReplyFieldInactive(props: ReplyFieldProps) {
  return <div>Locked</div>;
}

function ReplyFieldActive(props: Omit<ReplyFieldProps, 'lockMode'>) {
  const { group, onError, onSuccess } = props;
  const addToast = useToastHandle((s) => s.add);
  const addErrorToast = useAddErrorToast();
  const endpoint = api.blog.threads.addThreadItem.useMutation({
    onError: (err) => {
      onError?.(err);
      addErrorToast(err);
    },
    onSuccess: (data) => {
      addToast({
        type: 'success',
        message: getGlobalMessage('responses.blog.reply_success'),
      });
      onSuccess?.(data);
    },
  });
  return (
    <RawForm
      schema={$blogThreadContent}
      onSubmit={(data) => endpoint.mutate({ ...data, group })}
      form={() => <InnerReplyFieldForm {...props} />}
    />
  );
}

function InnerReplyFieldForm(props: Omit<ReplyFieldProps, 'lockMode'>) {
  return (
    <TextField
      type={'text'}
      tight
      ref={props.fieldRef}
      name={'content'}
      disabled={props.disabled || props.loading}
      tailing={props.loading && <Spinner size={20} />}
      required
      field={{ autoComplete: 'off' }}
      hookform={useRawForm<BlogThreadContentData>()}
      placeholder={useMessage(
        'general.add',
        getGlobalMessage('blog.comment.reply')
      )}
      sd={{ background: (t) => t.sys.color.surface[3] }}
    />
  );
}
