import { api } from '@/utils/api';

export type GetUserInput =
  | { email: string; id?: undefined }
  | { id: string; email?: undefined };

/** Tries to fetch a user with given `id` */
export function useUser(input: GetUserInput) {
  return api.user.getUser.useQuery(input, { staleTime: Infinity, retry: 2 });
}

/** Returns the appropriate username for given input user query */
export function getUserName(userQuery: ReturnType<typeof useUser>) {
  return userQuery.status === 'error'
    ? `[${userQuery.error.data?.code ?? 'ERROR'}]`
    : userQuery.data?.name;
}
