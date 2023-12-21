import { $song, $songContent, $songEdit } from '@/modules/setlist/song';
import {
  createPermissiveMiddleware,
  shallowSanitizationMiddleware,
  sharedRateLimitingMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import {
  createInfiniteQueryOutput,
  createInfiniteQueryResult,
  infiniteQueryInput,
} from '@/utils/schemas/infiniteQuery';
import { $cuidField } from '@/utils/schemas/shared';
import { pipePathRevalidate } from '@/utils/server/pipePathRevalidate';

const path = '/setlist';

export const setlistRouter = router({
  getSetlist: procedure
    .input(infiniteQueryInput)
    .output(createInfiniteQueryOutput($song))
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      return createInfiniteQueryResult(input, {
        infiniteData: await prisma.song.findMany({
          orderBy: { artist: 'asc' },
          skip: cursor,
          take: 1 + limit,
        }),
      });
    }),

  addSong: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('setlist.add'))
    .input($songContent)
    .use(shallowSanitizationMiddleware)
    .output($song)
    .mutation(async ({ input, ctx: { res } }) => {
      return await prisma.song
        .create({ data: input })
        .then(async (song) => {
          await prisma.event.create({
            data: {
              type: 'SONG',
              refId: song.id,
              title: song.name,
              content: song.artist,
            },
          });
          return song;
        })
        .then(pipePathRevalidate(path, res));
    }),

  editSong: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('setlist.edit'))
    .input($songEdit)
    .use(shallowSanitizationMiddleware)
    .output($song)
    .mutation(async ({ input: { id, ...data }, ctx: { res } }) => {
      return await prisma.song
        .update({ where: { id: id }, data })
        .then(async (song) => {
          const found = await prisma.event.findFirst({
            where: { refId: song.id, type: 'SONG' },
            select: { title: true, content: true },
          });
          if (
            found != null &&
            (found.content != song.artist || found.title != song.name)
          )
            await prisma.event.update({
              where: { refId_type: { refId: song.id, type: 'SONG' } },
              data: {
                content: song.artist,
                title: song.name,
              },
            });
          return song;
        })
        .then(pipePathRevalidate(path, res));
    }),

  deleteSong: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('setlist.delete'))
    .input($cuidField)
    .output($song)
    .mutation(async ({ input, ctx: { res } }) => {
      return await prisma.song
        .delete({ where: { id: input.id } })
        .then(pipePathRevalidate(path, res));
    }),
});
