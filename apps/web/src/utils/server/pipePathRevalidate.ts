import type { NextApiResponse } from 'next';

export async function pipePathRevalidate<TData>(
  path: string,
  res: NextApiResponse | undefined | null,
  dataIn: TData
): Promise<TData> {
  return res?.revalidate(path).then(() => dataIn) ?? dataIn;
}
