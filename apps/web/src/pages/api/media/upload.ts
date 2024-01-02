import { Permission } from '@/modules/auth/utils/permission';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'wrong method' });
  const session = await getServerSession(req, res, authOptions);
  if (!Permission.hasGlobalPermission(session, 'media.upload'))
    return res.status(401);
  // TODO parse w/ formidable, upload to S3 storage bucket and create database object.
  //  If failed -> delete item from storage bucket and delete database object
  return res.status(404);
}