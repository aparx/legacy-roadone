import { publicUserSchema } from '@/modules/schemas/user';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { z } from 'zod';

const userGetInput = z.union([
  z.object({ id: z.string() }),
  z.object({ email: z.string() }),
]);

export const userRouter = router({
  getUser: procedure
    .input(userGetInput)
    .output(publicUserSchema)
    .query(({ input }) => {
      // This requires `input` to have EXACTLY one key (!)
      return prisma.user
        .findUniqueOrThrow({ where: input })
        .catch((e) => handleAsTRPCError(e, 'NOT_FOUND'));
    }),
});
