import { ScrimConfig } from 'next-ui';
import type { BreakpointName } from 'theme-core';

export module NavbarConfig {
  export const height = 60;

  export const drawerBreakpoint = 'md' satisfies BreakpointName;

  export const zIndex = ScrimConfig.zIndex + 1;
}
