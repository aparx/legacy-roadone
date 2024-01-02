import type { NextApiResponse } from 'next';

export function pipePathRevalidate(
  path: string,
  res: NextApiResponse | undefined | null
) {
  return async <TData>(data: TData): Promise<TData> => {
    return (await res?.revalidate(path).then(() => data)) ?? data;
  };
}