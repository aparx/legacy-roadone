import { defaultRole, Role, roleArray } from '@/modules/schemas/role';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

export module Permission {
  export function getLevel(role: Role): number {
    return 1 + roleArray.indexOf(role);
  }

  export function isGreaterOrEqual(target: Role, than: Role) {
    return getLevel(target) >= getLevel(than);
  }

  export function isGreater(target: Role, than: Role) {
    return getLevel(target) > getLevel(than);
  }

  export function isLessOrEqual(target: Role, than: Role) {
    return !isGreater(target, than);
  }

  export function isLess(target: Role, than: Role) {
    return !isGreaterOrEqual(target, than);
  }

  export function getRoleOfSession(session: Session | undefined | null) {
    return session?.user?.role ?? defaultRole;
  }

  /** Returns the current role of the current session, or `defaultRole` */
  export function useRole() {
    return getRoleOfSession(useSession()?.data);
  }
}