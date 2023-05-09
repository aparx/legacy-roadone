import type { ApiContext } from '@/server/context';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.context<ApiContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure;
