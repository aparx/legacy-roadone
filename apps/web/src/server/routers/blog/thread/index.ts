import { getThread } from './getThread';
import { addItem } from '@/server/routers/blog/thread/addItem';
import { count } from '@/server/routers/blog/thread/count';
import { deleteItem } from '@/server/routers/blog/thread/deleteItem';
import { router } from '@/server/trpc';

export const blogThreadRouter = router({
  getThread,
  addItem,
  count,
  deleteItem,
});