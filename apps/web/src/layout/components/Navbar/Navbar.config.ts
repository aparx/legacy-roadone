import type { BreakpointName } from '../../../../../../packages/theme-core';
import { ScrimConfig } from 'next-ui';

export module NavbarConfig {
  export const height = 60;

  export const drawerBreakpoint = 'md' satisfies BreakpointName;

  export const zBaseIndex = ScrimConfig.zIndex - 1;

  export const zDrawerIndex = ScrimConfig.zIndex + 99;
}
