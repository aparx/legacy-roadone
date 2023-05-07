import type { Role } from '@/modules/schemas/role';
import { DefaultSession } from 'next-auth/src/core/types';

declare module 'next-auth' {
  export interface Session extends DefaultSession {
    user: DefaultSession['user'] & { id: string; role: Role };
  }
}
