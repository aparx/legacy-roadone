import { userRouter } from '@/server/routers/user';
import { procedure, router } from '@/server/trpc';

export const apiRouter = router({
  test: procedure.query(() => 'Hello world'),
  user: userRouter,
});

export type ApiRouter = typeof apiRouter;
