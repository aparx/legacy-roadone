import * as style from './BlogThreadGroup.style';
import { useToastHandle } from '@/handles';
import { logIn } from '@/modules/auth/utils/logInOut';
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
import type { GetBlogsOutput } from '@/server/routers/blog/getBlogs';
import type { DeleteThreadItemOutput } from '@/server/routers/blog/thread/deleteItem';
import { api } from '@/utils/api';
import { formatString } from '@/utils/format';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItem } from '@/utils/pages/infinite/infiniteItem';
import { useAddErrorToast } from '@/utils/toast';
import { Theme, useTheme } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { Button, Icon, Skeleton, Spinner, Stack, TextField, UI } from 'next-ui';
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
import { MdLock, MdLogin, MdSend } from 'react-icons/md';

/** @jsxImportSource @emotion/react */
export type InternalBlogThreadGroupProps = {
  fieldRef?: Ref<TextFieldRef>;
  blog: ProcessedBlogPostModel;
  group: BlogThread;
  /** If true showcases a loading state */
  loading?: boolean;
  /** Approximate number of replies or comments in this thread. */
  approximation: number;
};

/**
 * Component that renders a `BlogThread` as a group depending on the input
 * `group` given. Data relative to `group` is fetched automatically.
 */
export default function BlogThreadGroup(props: InternalBlogThreadGroupProps) {
  const { blog, group, approximation, fieldRef, loading } = props;
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

  // The real count of comments independent of the displayed comments
  const countQuery = api.blog.threads.count.useQuery(
    { group: queryParams.group },
    { enabled: session.status === 'authenticated' }
  );

  const apiContext = api.useContext();
  const items = data?.pages?.flatMap((page) => page.data) ?? [];
  const addThreadItem = async (item: BlogThreadItem) => {
    const group = queryParamsRef.current.group;
    // Add client side without refetching to immediately show the comment.
    apiContext.blog.threads.getThread.setInfiniteData({ group }, (state) => {
      const targetPage = state?.pages?.at(0);
      // prettier-ignore
      if (targetPage) targetPage.data.unshift(item);
      else return {
        pages: [{ data: [item], thisCursor: 0, nextCursor: 1 }],
        pageParams: [],
      };
      return state;
    });
    const field = ensuredFieldRef.current?.field;
    if (field) field.value = '';
    incrementCountsOfParents(apiContext, group, /* total */ 1, /* local */ 1);
    await countQuery.refetch();
  };
  const removeThreadItem = useCallback(
    async ({
      item: { item, affected },
    }: InfiniteItem<DeleteThreadItemOutput>) => {
      await countQuery.refetch();
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
      incrementCountsOfParents(
        apiContext,
        queryParamsRef.current.group,
        /* total */ -affected,
        /* local */ -1
      );
    },
    [apiContext, countQuery]
  );

  const isOwningComment =
    group.type === 'comment' &&
    session.data?.user?.id &&
    ((countQuery.data ?? 0) > 0 ||
      items.find((x) => x.authorId === session.data.user.id));

  const hitReplyLimit =
    group.type === 'reply' &&
    session.data?.user?.id &&
    ((countQuery.data ?? 0) >= Globals.maxPersonalBlogReplies ||
      items.filter((i) => i.authorId === session.data.user.id).length >=
        Globals.maxPersonalBlogReplies);

  const textFieldLockMode: ReplyFieldProps['lockMode'] =
    session.status === 'unauthenticated'
      ? 'auth'
      : isOwningComment || hitReplyLimit
      ? 'other'
      : undefined;

  const loadingState = isLoading || isFetching || loading;

  return (
    <Stack css={group.type !== 'comment' && style.deepWrapper} spacing={'lg'}>
      {(!textFieldLockMode || group.type !== 'reply' || hitReplyLimit) && (
        <BlogThreadReplyField
          {...props}
          lockMode={textFieldLockMode}
          lockMessage={
            textFieldLockMode === 'auth'
              ? getGlobalMessage('general.signInToComment')
              : isOwningComment
              ? getGlobalMessage('blog.comment.already_commented')
              : getGlobalMessage('blog.comment.already_replied')
          }
          fieldRef={multiRef(fieldRef, ensuredFieldRef)}
          loading={loadingState}
          onSuccess={addThreadItem}
          onError={() => {
            apiContext.blog.getBlogs
              .refetch(
                {},
                {
                  refetchPage: ({ data }: GetBlogsOutput) =>
                    data.findIndex((x) => x.id === group.blog) !== -1,
                }
              )
              .then(() => refetch({}));
          }}
        />
      )}
      {(items.length !== 0 || approximation !== 0) && (
        <Stack css={style.list} spacing={'lg'}>
          {items.length !== 0 &&
            items.map((item) => (
              <BlogThreadItemCard
                key={item.id}
                blog={blog}
                group={group}
                loading={loadingState}
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
          {formatString(
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

function incrementCountsOfParents(
  context: ReturnType<typeof api.useContext>,
  group: BlogThread,
  totalIncrease: number,
  localIncrease: number
) {
  return traverseUpdateParents(context, group, {
    updateBlog: (blog) => ({
      ...blog,
      totalCommentCount: Math.max(blog.totalCommentCount + totalIncrease, 0),
      commentCount:
        blog.commentCount && group.type === 'comment'
          ? Math.max(blog.commentCount + localIncrease, 0)
          : Math.max(localIncrease, 0),
    }),
    updateComment: (parent) => ({
      ...parent,
      replyCount:
        parent.replyCount != null
          ? Math.max(parent.replyCount + localIncrease, 0)
          : Math.max(localIncrease, 0),
    }),
  });
}

function traverseUpdateParents(
  context: ReturnType<typeof api.useContext>,
  group: BlogThread,
  handlers: {
    updateBlog?: (
      blog: Readonly<ProcessedBlogPostModel>
    ) => ProcessedBlogPostModel;
    updateComment?: (parent: Readonly<BlogCommentModel>) => BlogCommentModel;
  }
) {
  const { updateBlog, updateComment } = handlers;
  if (updateBlog)
    context.blog.getBlogs.setInfiniteData({}, (state) => {
      if (!state?.pages) return { pages: [], pageParams: [] };
      // Call `updateBlog` on fetched blog post
      return {
        ...state,
        pages: state.pages.map((page) => ({
          ...page,
          data: page.data.map((blog) => {
            if (blog.id !== group.blog) return blog;
            return updateBlog(blog) || blog;
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
  lockMessage?: string;
  onSuccess?: (data: BlogThreadItem) => any;
  onError?: (error: any) => any;
};

function BlogThreadReplyField(props: ReplyFieldProps) {
  const { lockMode, lockMessage, ...rest } = props;
  return lockMode ? (
    <ReplyFieldInactive
      lockMode={lockMode}
      lockMessage={lockMessage}
      loading={rest.loading}
    />
  ) : (
    <ReplyFieldActive {...rest} />
  );
}

function ReplyFieldInactive(
  props: Pick<ReplyFieldProps, 'lockMode' | 'lockMessage' | 'loading'>
) {
  const { lockMode, lockMessage, loading } = props;
  const theme = useTheme();
  return (
    <Stack
      onClick={lockMode === 'auth' ? logIn : undefined}
      direction={'row'}
      hAlign={'space-between'}
      sd={{
        paddingH: 'md',
        paddingV: 'md',
        roundness: UI.generalRoundness,
        emphasis: loading ? 'low' : 'high',
        cursor: lockMode === 'auth' ? 'pointer' : 'default',
        border: `1px solid ${theme.sys.color.scheme.surfaceVariant}`,
      }}
    >
      <Stack direction={'row'} sd={{ emphasis: 'medium' }}>
        <Icon
          icon={<MdLock />}
          aria-hidden={true}
          style={{ width: BlogThreadItemCardConfig.avatarSize }}
        />
        <span>{lockMessage}</span>
      </Stack>
      {lockMode === 'auth' && (
        <Button.Text
          leading={<MdLogin />}
          take={{ vPaddingMode: 'oof' }}
          sd={{ color: (t) => t.sys.color.scheme.primary }}
          onClick={logIn}
        >
          {getGlobalMessage('translation.signIn')}
        </Button.Text>
      )}
      {lockMode !== 'auth' && loading && <Spinner size={20} />}
    </Stack>
  );
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
      tailing={
        props.loading ? (
          <Spinner size={20} />
        ) : (
          <Button.Text tight icon={<MdSend />} take={{ vPaddingMode: 'oof' }} />
        )
      }
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
        sd={{ roundness: 'full', flexShrink: 0 }}
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
