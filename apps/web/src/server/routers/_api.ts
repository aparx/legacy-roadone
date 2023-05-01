import { procedure, router } from '@/server/trpc';

export const apiRouter = router({
  test: procedure.query(() => 'Hello world'),
});

export type ApiRouter = typeof apiRouter;
