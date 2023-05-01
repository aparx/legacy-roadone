import type { RuntimeTheme } from 'theme-core';

declare module '@emotion/react' {
  export interface Theme
    extends RuntimeTheme<{
      spacing: {};
      roundness: {};
    }> {}
}
