import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';

export const createApiContext = async ({
  req,
  res,
}: CreateNextContextOptions): Promise<ApiContext> => {
  return {
    session: await getServerSession(req, res, authOptions),
    req,
    res,
  };
};

export type ApiContext = {
  session: inferAsyncReturnType<typeof getSession>;
  req?: NextApiRequest | undefined | null;
  res?: NextApiResponse | undefined | null;
};
