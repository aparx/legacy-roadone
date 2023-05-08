import type { ApiRouter } from '@/server/routers/_api';
import { QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
// @ts-ignore
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const queryClient = new QueryClient();

export const api = createTRPCNext<ApiRouter>({
  config({ ctx }) {
    if (typeof window !== 'undefined') {
      // during client requests
      return {
        queryClient,
        transformer: superjson,
        links: [
          httpBatchLink({
            url: '/api/trpc',
          }),
        ],
      };
    }
    return {
      queryClient,
      transformer: superjson,
      links: [
        httpBatchLink({
          // The server needs to know your app's full url
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/v10/header
           */
          headers() {
            return ctx?.req?.headers ?? {};
          },
        }),
      ],
    };
  },
  ssr: true,
});
