import {
  publicUserSchema,
  UserSchema,
  userSchema,
} from '@/modules/schemas/user';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';
import { handleAsTRPCError } from '@/server/utils/trpcError';
import { z } from 'zod';

const userGetInput = z.union([
  userSchema.pick({ id: true }).required(),
  userSchema.pick({ email: true }).required(),
]);

export const userRouter = router({
  getUser: procedure
    .input(userGetInput)
    .output(publicUserSchema)
    .query(({ input }) => {
      // This requires `input` to have EXACTLY one key (!)
      const inputKey = Object.keys(input)[0];
      return prisma.user
        .findUnique({ where: { [inputKey]: input[inputKey] } })
        .then((data) => data as UserSchema)
        .catch((e) => handleAsTRPCError(e, 'NOT_FOUND'));
    }),
});
