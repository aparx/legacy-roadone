import { UserModel } from '@/modules/schemas/user';
import { DefaultSession } from 'next-auth/core/types';

declare module 'next-auth' {
  export interface Session extends DefaultSession {
    user: UserModel;
  }
}