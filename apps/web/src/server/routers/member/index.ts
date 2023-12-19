import { $member } from '@/modules/home/member';
import { prisma } from '@/server/prisma';
import { procedure, router } from '@/server/trpc';

export const memberRouter = router({
  get: procedure.output($member.array()).query(() => prisma.member.findMany()),
});
