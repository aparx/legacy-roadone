import { Page } from '@/components';
import { Permission } from '@/modules/auth/utils/permission';
import {
  BlogPostContentData,
  blogPostContentSchema,
  BlogPostData,
  BlogPostProcessedData,
} from '@/modules/blogs/blogPost';
import { BlogPostCard } from '@/modules/blogs/components/BlogPostCard';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { useLocalState, useLocalToggle } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import {
  useDeleteDialog,
  useMutateDialog,
  UseMutateFormInput,
  UseMutateType,
} from '@/utils/pages/infinite/infiniteDialog';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Button, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { useEffect, useRef } from 'react';
import { MdAdd, MdTitle } from 'react-icons/md';
import superjson from 'superjson';

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  await helpers.blog.getBlogs.prefetchInfinite({});
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.blogs,
  };
}

export default function BlogPage() {
  // prettier-ignore
  const { data, refetch, fetchNextPage, isFetchingNextPage, hasNextPage } =
    api.blog.getBlogs.useInfiniteQuery({}, {
      trpc: { abortOnUnmount: true },
      getNextPageParam: (lastPage) => lastPage?.nextCursor
    });
  const refreshBlogs = () => refetch({ type: 'all' });
  const editDialog = useMutateDialog({
    title: useMessage('general.edit', getGlobalMessage('blog.post.name')),
    type: 'edit',
    endpoint: api.blog.editBlog.useMutation(),
    schema: blogPostContentSchema,
    response: { success: getGlobalMessage('responses.blog.edit_success') },
    form: (props) => <BlogPostForm {...props} />,
    width: 'md',
    onSuccess: refreshBlogs,
  });
  const deleteDialog = useDeleteDialog({
    title: useMessage('general.delete', getGlobalMessage('blog.post.name')),
    endpoint: api.blog.deleteBlog.useMutation(),
    width: 'sm',
    onSuccess: refreshBlogs,
  });
  return (
    <Page name={'Blogs'} pageURL={'/blogs'}>
      {Permission.useGlobalPermission('blog.post') && (
        <AddBlogPanel onSuccess={refreshBlogs} />
      )}
      <Stack as={'main'} hAlign sd={{ childLength: 'md' }}>
        {data?.pages
          ?.flatMap((p) => p.data)
          .map((blog, index) => (
            <BlogPostItem
              key={blog.id}
              index={index}
              blog={blog}
              onEdit={editDialog}
              onDelete={deleteDialog}
            />
          ))}
        {hasNextPage && (
          <Button.Text
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {getGlobalMessage('general.load_more')}
          </Button.Text>
        )}
      </Stack>
    </Page>
  );
}

type BlogPostSingleProps = {
  index: number;
  blog: BlogPostProcessedData;
} & InfiniteItemEvents<BlogPostData>;

function BlogPostItem({ index, blog, onDelete, onEdit }: BlogPostSingleProps) {
  const blogState = useLocalState(blog);
  const localStateRef = useRef(blogState);
  // prettier-ignore
  useEffect(() => { localStateRef.current = blogState });
  useEffect(() => localStateRef.current.set(blog), [blog]);
  return (
    <BlogPostCard
      onDelete={onDelete}
      onEdit={onEdit}
      context={{
        data: blogState,
        showReplies: useLocalToggle(index === 0),
      }}
    />
  );
}

// <================================>
//       RESTRICTED COMPONENTS
// <================================>

function AddBlogPanel(props: { onSuccess: (data: BlogPostData) => any }) {
  const mutation = api.blog.addBlog.useMutation();
  const addDialog = useMutateDialog({
    title: useMessage('general.add', getGlobalMessage('blog.post.name')),
    type: 'add',
    endpoint: mutation,
    schema: blogPostContentSchema,
    form: (props) => <BlogPostForm {...props} />,
    width: 'md',
    onSuccess: props.onSuccess,
  });
  return (
    <Stack hAlign sd={{ marginBottom: 'xl', childLength: 'md' }}>
      <div>
        <Button.Primary leading={<MdAdd />} onClick={() => addDialog()}>
          {useMessage('general.add', getGlobalMessage('blog.post.name'))}
        </Button.Primary>
      </div>
    </Stack>
  );
}

// <======================================>
//                Blog FORMS
// <======================================>

function BlogPostForm<TType extends UseMutateType>(
  props: UseMutateFormInput<TType, typeof blogPostContentSchema>
) {
  const {
    endpoint: { isLoading },
  } = props;
  const item = props.type === 'edit' ? props.item : undefined;
  const form = useRawForm<BlogPostContentData>();
  return (
    <Stack spacing={'lg'}>
      {isLoading && <div>LOADING...</div>}
      <TextField
        name={'title'}
        placeholder={getGlobalMessage('translation.title')}
        field={{ defaultValue: item?.title }}
        leading={<MdTitle />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'content'}
        type={'textarea'}
        placeholder={getGlobalMessage('translation.content')}
        field={{ defaultValue: item?.content }}
        required
        disabled={isLoading}
        hookform={form}
      />
      <label>
        Kommentare verbieten
        <input
          type={'checkbox'}
          defaultChecked={!!item?.repliesDisabled}
          {...form.methods.register('repliesDisabled')}
        />
      </label>
    </Stack>
  );
}
