import type { Theme as ThemeCore } from 'theme-core';

declare module '@emotion/react' {
  export interface Theme extends ThemeCore {}
}
