import * as style from './BlogThreadGroup.style';
import { useToastHandle } from '@/handles';
import {
  $blogThreadContent,
  BlogCommentModel,
  BlogThreadContentData,
  BlogThreadItem,
  ProcessedBlogPostModel,
} from '@/modules/blog/blog';
import BlogThreadItemCard from '@/modules/blog/components/BlogThreadItemCard/BlogThreadItemCard';
import { BlogThreadItemCardConfig } from '@/modules/blog/components/BlogThreadItemCard/BlogThreadItemCard.config';
import { BlogThread } from '@/modules/blog/utils/thread/blogThread';
import type { DeleteThreadItemOutput } from '@/server/routers/blog/thread/deleteItem';
import { api } from '@/utils/api';
import { formatMessage } from '@/utils/format';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItem } from '@/utils/pages/infinite/infiniteItem';
import { useAddErrorToast } from '@/utils/toast';
import { Theme } from '@emotion/react';
import { useSession } from 'next-auth/react';
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
  const session = useSession();
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
    enabled: session.status !== 'loading',
  });

  const apiContext = api.useContext();
  const items = data?.pages?.flatMap((page) => page.data) ?? [];
  const addThreadItem = () => {
    const group = queryParamsRef.current.group;
    refetch({ type: 'all' }).then(() => {
      const field = ensuredFieldRef.current?.field;
      if (field) field.value = '';
      changeParentsCounters(apiContext, group, 1, 1);
    });
  };
  const removeThreadItem = useCallback(
    ({ item: { item, affected } }: InfiniteItem<DeleteThreadItemOutput>) => {
      apiContext.blog.threads.getThread.setInfiniteData(
        queryParamsRef.current,
        (state) => ({
          // prettier-ignore
          pages: state?.pages?.map((page) => ({
            ...page,
            data: page.data.filter((c) => c.id !== item.id),
          })) ?? [],
          pageParams: state?.pageParams ?? [],
        })
      );
      changeParentsCounters(
        apiContext,
        queryParamsRef.current.group,
        -affected,
        -1
      );
    },
    [apiContext]
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

// <===========================================>
//       NOTIFY PARENT (COUNTER) UTILITIES
// <===========================================>

function changeParentsCounters(
  context: ReturnType<typeof api.useContext>,
  group: BlogThread,
  totalIncrease: number,
  localIncrease: number
) {
  return notifyParent(
    context,
    group,
    (blog) => ({
      ...blog,
      totalCommentCount: Math.max(blog.totalCommentCount + totalIncrease, 0),
      commentCount:
        blog.commentCount && group.type === 'comment'
          ? Math.max(blog.commentCount + localIncrease, 0)
          : blog.commentCount,
    }),
    (parent) => ({
      ...parent,
      replyCount:
        parent.replyCount != null
          ? parent.replyCount + localIncrease
          : undefined,
    })
  );
}

function notifyParent(
  context: ReturnType<typeof api.useContext>,
  group: BlogThread,
  updateBlog: (
    blog: Readonly<ProcessedBlogPostModel>
  ) => ProcessedBlogPostModel,
  updateComment?: (parent: Readonly<BlogCommentModel>) => BlogCommentModel
) {
  context.blog.getBlogs.setInfiniteData({}, (state) => {
    if (!state?.pages) return { pages: [], pageParams: [] };
    // Call `updateBlog` on fetched blog post
    return {
      ...state,
      pages: state.pages.map((page) => ({
        ...page,
        data: page.data.map((blog) => {
          if (blog.id !== group.blog) return blog;
          return updateBlog(blog);
        }),
      })),
    };
  });
  if (group.type === 'reply' && updateComment)
    context.blog.threads.getThread.setInfiniteData(
      { group: { type: 'comment', blog: group.blog } },
      (state) => {
        if (!state?.pages) return { pages: [], pageParams: [] };
        return {
          ...state,
          pages: state.pages.map((page) => ({
            ...page,
            data: page.data.map((comment) => {
              if (comment.id !== group.parent) return comment;
              return { ...updateComment(comment), type: 'comment' };
            }),
          })),
        };
      }
    );
}

// <===========================================>
//   REPLY TEXTFIELDS & THREAD ITEM SKELETONS
// <===========================================>

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
