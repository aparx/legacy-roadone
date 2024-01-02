import json from './generated.json';
import type { Theme } from 'theme-core';
import { createRuntimeTheme } from 'theme-core';


// since `json` is automatically generated using index-cli & index-generator,
// it is safe to assume that `json` meets the `Theme` type declaration.
export const theme = createRuntimeTheme(json as Theme, {
  namedMultipliers: {
    spacing: {
      xxl: 3.0,
      xl: 2.0,
      lg: 1.5,
      md: 1,
      sm: 0.5,
    },
    roundness: {
      full: 100,
      xl: 2.0,
      lg: 1.5,
      md: 1,
      sm: 0.5,
    },
  },
});