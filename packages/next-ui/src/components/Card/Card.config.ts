import { HTMLTag } from '../../utils';
import type { BreakpointName } from 'theme-core';

export module CardConfig {
  export module Defaults {
    export const width = 'md' satisfies BreakpointName;
    export const tag = 'div' satisfies HTMLTag;
  }
}
