import { createApiContext } from '@/server/context';
import { apiRouter } from '@/server/routers/_api';
import { createNextApiHandler } from '@trpc/server/adapters/next';

export default createNextApiHandler({
  router: apiRouter,
  createContext: createApiContext,
});