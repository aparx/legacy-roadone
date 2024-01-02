import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';


// According to https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  (function () {
    const clientId = uuidv4();
    const client = new PrismaClient();
    console.debug('Opening client', clientId);
    client.$on('beforeExit', () => console.debug('Closing client', clientId));
    return client;
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;