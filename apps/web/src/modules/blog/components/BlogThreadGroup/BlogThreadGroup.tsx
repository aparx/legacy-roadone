import * as style from './BlogThreadGroup.style';
import { useToastHandle } from '@/handles';
import {
  $blogThreadContent,
  BlogThreadContentData,
  BlogThreadItem,
  ProcessedBlogPostModel,
} from '@/modules/blog/blog';
import BlogThreadItemCard from '@/modules/blog/components/BlogThreadItemCard/BlogThreadItemCard';
import { BlogThreadItemCardConfig } from '@/modules/blog/components/BlogThreadItemCard/BlogThreadItemCard.config';
import { BlogThread } from '@/modules/blog/utils/thread/blogThread';
import type { DeleteThreadItemOutput } from '@/server/routers/blog/thread';
import { api } from '@/utils/api';
import { formatMessage } from '@/utils/format';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItem } from '@/utils/pages/infinite/infiniteItem';
import { useAddErrorToast } from '@/utils/toast';
import { Theme } from '@emotion/react';
import { Button, Skeleton, Spinner, Stack, TextField } from 'next-ui';
import RawForm from 'next-ui/src/components/RawForm/RawForm';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { TextFieldRef } from 'next-ui/src/components/TextField/TextField';
import { multiRef } from 'next-ui/src/utils/mutliRef';
import {
  ReactElement,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

/** @jsxImportSource @emotion/react */
export type InternalBlogThreadGroupProps = {
  fieldRef?: Ref<TextFieldRef>;
  blog: ProcessedBlogPostModel;
  group: BlogThread;
  /** Approximate number of replies or comments in this thread. */
  approximation: number;
};

/**
 * Component that renders a `BlogThread` as a group depending on the input
 * `group` given. Data relative to `group` is fetched automatically.
 */
export default function BlogThreadGroup(props: InternalBlogThreadGroupProps) {
  const { blog, group, approximation, fieldRef } = props;
  const queryParams = { group } as const;
  const queryParamsRef = useRef(queryParams);
  const ensuredFieldRef = useRef<TextFieldRef>(null);
  // prettier-ignore
  useEffect(() => { queryParamsRef.current = queryParams });
  const {
    data,
    isFetching,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = api.blog.threads.getThread.useInfiniteQuery(queryParams, {
    // getPreviousPageParam: (lastPage) => lastPage?.thisCursor,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
  const apiContext = api.useContext();
  const items = data?.pages?.flatMap((page) => page.data) ?? [];
  const addThreadItem = () => refetch({ type: 'all' });
  const removeThreadItem = useCallback(
    ({ item }: InfiniteItem<DeleteThreadItemOutput>) => {
      apiContext.blog.threads.getThread.setInfiniteData(
        queryParamsRef.current,
        (state) => ({
          // prettier-ignore
          pages: state?.pages?.map(({ data, ...rest }) => ({
            data: data.filter((itr) => itr.id !== item.item.id),
            ...rest,
          })) ?? [],
          pageParams: state?.pageParams ?? [],
        })
      );
    },
    [apiContext.blog.threads.getThread]
  );

  return (
    <Stack css={group.type !== 'comment' && style.deepWrapper}>
      <BlogThreadReplyField
        {...props}
        fieldRef={multiRef(fieldRef, ensuredFieldRef)}
        loading={isLoading || isFetching}
        onError={() => refetch({})}
        onSuccess={addThreadItem}
      />
      {(items.length !== 0 || approximation !== 0) && (
        <Stack css={style.list} spacing={'lg'}>
          {items.length !== 0 &&
            items.map((item) => (
              <BlogThreadItemCard
                key={item.id}
                blog={blog}
                group={group}
                item={item}
                groupField={ensuredFieldRef}
                onDelete={removeThreadItem}
              />
            ))}
          {(isFetchingNextPage || (isLoading && items.length === 0)) && (
            <ThreadSkeletonGroup
              totalCount={approximation}
              displayCount={items.length}
              limit={Globals.commentFetchPageLimit}
            />
          )}
        </Stack>
      )}
      {hasNextPage && (
        <Button.Text
          take={{ vPaddingMode: 'oof' }}
          onClick={() => fetchNextPage()}
        >
          {formatMessage(
            getGlobalMessage('general.load_more'),
            getGlobalMessage('blog.comment.reply')
          )}
        </Button.Text>
      )}
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
  return lockMode ? <ReplyFieldInactive /> : <ReplyFieldActive {...rest} />;
}

function ReplyFieldInactive() {
  return <div>Locked</div>;
}

function ReplyFieldActive(props: Omit<ReplyFieldProps, 'lockMode'>) {
  const { group, onError, onSuccess } = props;
  const { loading, ...restProps } = props;
  const addToast = useToastHandle((s) => s.add);
  const addErrorToast = useAddErrorToast();
  const endpoint = api.blog.threads.addItem.useMutation({
    onError: (err) => {
      onError?.(err);
      addErrorToast(err);
    },
    onSuccess: (data) => {
      addToast({
        type: 'success',
        message: getGlobalMessage('responses.blog.reply_add_success'),
      });
      onSuccess?.(data);
    },
  });
  return (
    <RawForm
      schema={$blogThreadContent}
      onSubmit={(data) => endpoint.mutate({ ...data, group })}
      form={() => (
        <InnerReplyFieldForm
          {...restProps}
          loading={loading || endpoint.status === 'loading'}
        />
      )}
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

type ThreadSkeletonGroupProps = {
  totalCount: number;
  displayCount: number;
  limit: number;
};

function ThreadSkeletonGroup(props: ThreadSkeletonGroupProps) {
  const { totalCount, displayCount, limit } = props;
  let count = Math.max(Math.min(totalCount - displayCount, limit), 0);
  console.log(count, totalCount, displayCount, limit);
  const skeletons: ReactElement[] = new Array(count);
  while (count-- !== 0) skeletons.push(<ThreadItemSkeleton key={count} />);
  return <>{skeletons}</>;
}

function ThreadItemSkeleton() {
  const baseColor = (t: Theme) => t.sys.color.surface[4];
  const scanColor = (t: Theme) => t.sys.color.scheme.surfaceVariant;
  const maxWidth = useMemo(() => Math.round(150 + Math.random() * 100), []);
  return (
    <Stack direction={'row'} aria-hidden={true}>
      <Skeleton
        baseColor={baseColor}
        scanColor={scanColor}
        width={BlogThreadItemCardConfig.avatarSize}
        height={BlogThreadItemCardConfig.avatarSize}
        sd={{ roundness: 'full' }}
      />
      <Stack spacing={'sm'} sd={{ width: '100%' }}>
        <Skeleton
          baseColor={baseColor}
          scanColor={scanColor}
          height={20}
          style={{ maxWidth: maxWidth, width: '100%' }}
        />
        <Skeleton
          baseColor={baseColor}
          scanColor={scanColor}
          height={40}
          style={{ width: '75%' }}
        />
      </Stack>
    </Stack>
  );
}
