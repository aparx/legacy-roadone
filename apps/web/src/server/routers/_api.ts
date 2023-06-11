import { blogRouter } from '@/server/routers/blog';
import { gigRouter } from '@/server/routers/gig';
import { setlistRouter } from '@/server/routers/setlist';
import { userRouter } from '@/server/routers/user';
import { procedure, router } from '@/server/trpc';

export const apiRouter = router({
  test: procedure.query(() => 'Hello world'),
  user: userRouter,
  gig: gigRouter,
  setlist: setlistRouter,
  blog: blogRouter,
});

export type ApiRouter = typeof apiRouter;
