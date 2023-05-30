import { apiRouter } from '@/server/routers/_api';
import { queryClient } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  // await helpers.blog.getBlogs.prefetchInfinite({});
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.blogs,
  };
}

export default function BlogPage() {}
