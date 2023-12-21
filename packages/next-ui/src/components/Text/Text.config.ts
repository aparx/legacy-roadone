import type { HTMLTag } from '../../utils';
import type { OpacityEmphasis, TypescaleRole, TypescaleSize } from 'theme-core';
import type { DeepPartial } from 'utility-types';

/** Config module for the `Text` component(s) */
export module TextConfig {
  export module Defaults {
    export const emphasis = 'high' satisfies OpacityEmphasis;
    export const tag = 'div' satisfies HTMLTag;
  }

  export type TagMap = DeepPartial<
    Record<TypescaleRole, Record<TypescaleSize, HTMLTag>>
  >;

  /** Level map */
  export const tagMap: TagMap = {
    headline: {
      lg: 'h1',
      md: 'h2',
      sm: 'h3',
    },
    title: {
      lg: 'h4',
      md: 'h5',
      sm: 'h6',
    },
  };
}
