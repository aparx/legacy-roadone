import { Page } from '@/components';
import { Permission } from '@/modules/auth/utils/permission';
import { $blogPostContent, BlogPostContentData } from '@/modules/blog/blog';
import { BlogPostCard } from '@/modules/blog/components/BlogPostCard';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import {
  useDeleteDialog,
  useMutateDialog,
  UseMutateFormInput,
  UseMutateType,
} from '@/utils/pages/infinite/infiniteDialog';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { useTheme } from '@emotion/react';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Button, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { useMemo } from 'react';
import superjson from 'superjson';

import useGlobalPermission = Permission.useGlobalPermission;

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
  const { data, isLoading, isFetching, refetch } =
    api.blog.getBlogs.useInfiniteQuery({});
  const canAdd = useGlobalPermission('blog.post');
  const posts = useMemo(
    () => data?.pages?.flatMap((p) => p.data),
    [data?.pages]
  );
  // TODO dialogs

  const apiContext = api.useContext();

  // Add dialog that requires `$blogPostContent` and `BlogPostMutateForm`
  const addDialog = useMutateDialog({
    type: 'add',
    endpoint: api.blog.addBlog.useMutation(),
    width: 'md',
    title: useMessage('general.add', getGlobalMessage('blog.post.name')),
    schema: $blogPostContent,
    form: (props) => <BlogPostMutateForm {...props} />,
    onSuccess: () => refetch({}),
  });

  const editDialog = useMutateDialog({
    type: 'edit',
    endpoint: api.blog.editBlog.useMutation(),
    width: 'md',
    title: useMessage('general.edit', getGlobalMessage('blog.post.name')),
    schema: $blogPostContent,
    form: (props) => <BlogPostMutateForm {...props} />,
    onSuccess: () => refetch({}),
  });

  const deleteDialog = useDeleteDialog({
    title: useMessage('general.delete', getGlobalMessage('blog.post.name')),
    endpoint: api.blog.deleteBlog.useMutation(),
    onSuccess: () => refetch({}),
  });

  return (
    <Page name={'blogs'} pageURL={'/blogs'}>
      <Stack as={'main'} hAlign sd={{ childLength: 'md' }}>
        {canAdd && <AddBlogPostItem onAdd={addDialog} />}
        {posts?.map((post) => (
          <BlogPostCard
            key={post.id}
            blogPost={post}
            isLoading={isLoading}
            isFetching={isFetching}
            onDelete={deleteDialog}
            onEdit={editDialog}
          />
        ))}
      </Stack>
    </Page>
  );
}

/** Component that represents a button that allows to add a blog post. */
const AddBlogPostItem = <TItem extends object>(
  props: InfiniteItemEvents<TItem, 'add'>
) => (
  // applying a wrapper mainly because of styling and additional margin
  <div style={{ marginBottom: useTheme().rt.multipliers.spacing('md') }}>
    <Button.Primary onClick={props.onAdd}>
      {useMessage('general.add', getGlobalMessage('blog.post.name'))}
    </Button.Primary>
  </div>
);

function BlogPostMutateForm<TType extends UseMutateType>(
  props: UseMutateFormInput<TType, typeof $blogPostContent>
) {
  const {
    endpoint: { isLoading },
  } = props;
  const form = useRawForm<BlogPostContentData>();
  const item = props.type === 'edit' ? props.item : undefined;
  return (
    <Stack spacing={'lg'}>
      <TextField
        name={'title'}
        placeholder={getGlobalMessage('translation.title')}
        field={{ defaultValue: item?.title }}
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
        {/* TODO replace with checkbox */}
        Kommentare verbieten
        <input
          type={'checkbox'}
          defaultChecked={item?.commentsDisabled}
          {...form.methods.register('commentsDisabled')}
        />
      </label>
    </Stack>
  );
}
