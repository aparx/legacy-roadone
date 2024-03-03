import { blogRouter } from '@/server/routers/blog';
import { eventRouter } from '@/server/routers/event';
import { gigRouter } from '@/server/routers/gig';
import { mediaRouter } from '@/server/routers/media';
import { setlistRouter } from '@/server/routers/setlist';
import { userRouter } from '@/server/routers/user';
import { procedure, router } from '@/server/trpc';

export const apiRouter = router({
  test: procedure.query(() => 'Hello world'),
  user: userRouter,
  gig: gigRouter,
  setlist: setlistRouter,
  media: mediaRouter,
  blog: blogRouter,
  event: eventRouter,
});

export type ApiRouter = typeof apiRouter;
