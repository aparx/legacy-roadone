import type { StackProps } from './Stack';

export module StackConfig {
  export module Defaults {
    export const direction = 'column' satisfies StackProps<any>['direction'];
    export const spacing = 1 satisfies StackProps<any>['spacing'];
    export const tag = 'div' satisfies StackProps<any>['as'];
  }
}
