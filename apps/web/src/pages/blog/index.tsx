import { DialogConfig, Page } from '@/components';
import { useDialogHandle, useToastHandle } from '@/handles';
import { Permission } from '@/modules/auth/utils/permission';
import {
  BlogContentData,
  blogContentSchema,
  BlogData,
  BlogEditData,
} from '@/modules/schemas/blog';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { UseTRPCMutationResult } from '@trpc/react-query/shared';
import { Button, Stack, TextField } from 'next-ui';
import { useRawForm } from 'next-ui/src/components/RawForm/context/rawFormContext';
import { useCallback } from 'react';
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
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    api.blog.getBlogs.useInfiniteQuery({}, {
      trpc: { abortOnUnmount: true },
      staleTime: Infinity,
      getNextPageParam: (lastPage) => lastPage?.nextCursor
    });
  return (
    <Page name={'Blogs'} pageURL={'/blogs'}>
      {Permission.useGlobalPermission('postBlogs') && <AddPanel />}
      {data?.pages
        ?.flatMap((p) => p.data)
        .map((data) => {
          return (
            <Stack key={data.id}>
              <p>{data.title}</p>
              <div
                style={{ whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{
                  __html: data.htmlContent ?? data.content,
                }}
              />
            </Stack>
          );
        })}
    </Page>
  );
}
// <================================>
//       RESTRICTED COMPONENTS
// <================================>

function AddPanel() {
  const mutation = api.blog.addBlog.useMutation();
  const addGigDialog = useMutateBlogDialog({ type: 'add', endpoint: mutation });
  return (
    <Stack hAlign sd={{ marginBottom: 'xl', childLength: 'md' }}>
      <div>
        <Button.Primary leading={<MdAdd />} onClick={() => addGigDialog()}>
          {useMessage('general.add', getGlobalMessage('blog.name'))}
        </Button.Primary>
      </div>
    </Stack>
  );
}

// <======================================>
//                Blog FORMS
// <======================================>

type BlogDialogProps =
  | {
      type: 'add';
      endpoint: UseTRPCMutationResult<
        BlogContentData,
        any,
        BlogContentData,
        any
      >;
      blog?: BlogData;
    }
  | {
      type: 'edit';
      endpoint: UseTRPCMutationResult<BlogEditData, any, BlogEditData, any>;
      blog?: BlogData;
    };

function useMutateBlogDialog(props: Omit<BlogDialogProps, 'blog'>) {
  const { type, endpoint } = props;
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const addToast = useToastHandle((s) => s.add);
  const title = useMessage(`general.${type}`, getGlobalMessage('blog.name'));
  return useCallback(
    (blog?: BlogData) => {
      showDialog({
        title,
        type: 'form',
        width: 'lg',
        actions: DialogConfig.dialogSaveCancelSource,
        schema: blogContentSchema,
        content: <BlogInputForm {...({ ...props, blog } as BlogDialogProps)} />,
        handleSubmit: (data) => {
          let newData: any = data;
          if (type === 'edit')
            newData = { ...data, id: blog!.id } satisfies BlogEditData;
          endpoint.mutate(newData, {
            onSuccess: () => {
              closeDialog();
              addToast({
                type: 'success',
                title: getGlobalMessage('general.actionSuccess'),
                message: getGlobalMessage(`responses.blog.${type}_success`),
              });
            },
            onError: (error) => {
              addToast({
                type: 'error',
                title: getGlobalMessage('general.actionFailed'),
                message: `${getGlobalMessage(
                  error.message as any,
                  error.message
                )}`,
              });
            },
          });
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showDialog, type, endpoint, closeDialog, addToast]
  );
}

function BlogInputForm({ endpoint, blog }: BlogDialogProps) {
  const { isLoading } = endpoint;
  const form = useRawForm<BlogContentData>();
  return (
    <Stack spacing={'lg'}>
      {isLoading && <div>LOADING...</div>}
      <TextField
        name={'title'}
        placeholder={getGlobalMessage('translation.title')}
        field={{ defaultValue: blog?.title }}
        leading={<MdTitle />}
        required
        disabled={isLoading}
        hookform={form}
      />
      <TextField
        name={'content'}
        type={'textarea'}
        placeholder={getGlobalMessage('translation.content')}
        field={{ defaultValue: blog?.content }}
        required
        disabled={isLoading}
        hookform={form}
      />
    </Stack>
  );
}
