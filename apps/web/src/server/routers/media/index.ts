import { Permission } from '@/modules/auth/utils/permission';
import {
  $mediaGroupContent,
  $mediaGroupEdit,
  $mediaItemType,
  $mediaUrlItemContentMultiples,
  MediaGroupModel,
  ProcessedMediaGroupModel,
  ProcessedMediaItemModel,
} from '@/modules/media/media';
import {
  createPermissiveMiddleware,
  shallowSanitizationMiddleware,
  sharedRateLimitingMiddleware,
} from '@/server/middleware';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import {
  createInfiniteQueryInput,
  createInfiniteQueryResult,
  infiniteQueryInput,
} from '@/utils/schemas/infiniteQuery';
import { $cuidField } from '@/utils/schemas/shared';
import { z } from 'zod';

import hasGlobalPermission = Permission.hasGlobalPermission;

export const mediaRouter = router({
  getGroups: procedure
    .input(
      createInfiniteQueryInput(3, 3).extend({
        type: $mediaItemType.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, type } = input;

      const canManage = hasGlobalPermission(ctx.session, 'media.group.manage');

      // @ts-ignore
      const pinned = (await prisma.mediaGroup.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          pinned: true,
          items: (!canManage && type && { some: { type } }) || undefined,
        },
        select: (cursor > 0 && { id: true }) || undefined,
        include:
          cursor === 0
            ? { _count: { select: { items: { where: { type } } } } }
            : undefined,
        skip: input.cursor,
        take: 1 + input.limit,
      })) as Array<MediaGroupModel & { _count: { items: number } }>;

      const general =
        pinned.length <= input.limit
          ? await prisma.mediaGroup.findMany({
              orderBy: { createdAt: 'desc' /* TODO as index */ },
              where: {
                items: (!canManage && type && { some: { type } }) || undefined,
                id: {
                  notIn: pinned.map((x: Pick<MediaGroupModel, 'id'>) => x.id),
                },
              },
              include: { _count: { select: { items: { where: { type } } } } },
              skip: input.cursor,
              take: 1 + input.limit - pinned.length,
            })
          : [];

      const data: (MediaGroupModel & { _count?: { items: number } })[] =
        cursor === 0 ? [...pinned, ...general] : general;

      return createInfiniteQueryResult(input, {
        infiniteData: data.map<ProcessedMediaGroupModel>(({ _count, ...x }) => {
          return { ...x, typeItemCount: _count?.items };
        }),
      });
    }),

  addGroup: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('media.group.manage'))
    .input($mediaGroupContent)
    .use(shallowSanitizationMiddleware)
    .mutation(({ input }) => {
      return prisma.mediaGroup.create({ data: input });
    }),

  editGroup: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('media.group.manage'))
    .input($mediaGroupEdit)
    .use(shallowSanitizationMiddleware)
    .mutation(({ input: { id, ...data } }) => {
      return prisma.mediaGroup.update({ where: { id }, data });
    }),

  deleteGroup: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('media.group.manage'))
    .input($cuidField)
    .mutation(({ input }) => {
      return prisma.mediaGroup.delete({ where: { id: input.id } });
    }),

  getItems: procedure
    .input(
      infiniteQueryInput.extend({
        group: z.string(),
        type: $mediaItemType.optional(),
      })
    )
    .query(async ({ input }) => {
      const items = await prisma.mediaItem.findMany({
        where: { groupId: input.group, type: input.type },
        orderBy: { createdAt: 'asc' },
        skip: input.cursor,
        take: 1 + input.limit,
      });
      return createInfiniteQueryResult(input, {
        infiniteData: items.map((x): ProcessedMediaItemModel => {
          const { url, ...item } = x;
          let publicURL = url;
          if (url && url?.startsWith('/'))
            publicURL = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}${url}`;
          else if (!url)
            publicURL = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${x.id}`;
          return { ...item, publicURL };
        }),
      });
    }),

  deleteItem: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('media.upload'))
    .input($cuidField)
    .mutation(({ input: { id } }) => {
      return prisma.mediaItem.delete({ where: { id } });
    }),

  addURLItem: procedure
    .use(sharedRateLimitingMiddleware)
    .use(createPermissiveMiddleware('media.upload'))
    .input($mediaUrlItemContentMultiples)
    .mutation(({ input }) => {
      const { items } = input;
      return items.map(async ({ groupId, ...data }) => {
        return await prisma.mediaItem.create({
          data: { group: { connect: { id: groupId } }, ...data },
        });
      });
    }),
});
