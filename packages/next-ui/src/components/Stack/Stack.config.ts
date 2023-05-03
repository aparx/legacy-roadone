import type { HTMLTag } from '../../utils';
import type { StackData } from './Stack';

export module StackConfig {
  export module Defaults {
    export const direction = 'column' satisfies StackData['direction'];
    export const spacing = 1 satisfies StackData['spacing'];
    export const tag = 'div' satisfies HTMLTag;
  }
}
