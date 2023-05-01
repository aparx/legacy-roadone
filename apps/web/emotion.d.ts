import { theme } from '@/styles/theme';
import { RuntimeTheme } from 'theme-core';

// prettier-ignore
type InferRuntimeMultipliers<TTheme> =
  TTheme extends RuntimeTheme<infer _TMultipliers> ? _TMultipliers : never;

declare module '@emotion/react' {
  export interface Theme
    extends RuntimeTheme<InferRuntimeMultipliers<typeof theme>> {}
}
