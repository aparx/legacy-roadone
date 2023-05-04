import type { HTMLTag } from '../../utils';
import type { TypescaleRole, TypescaleSize } from 'theme-core';
import type { DeepPartial } from 'utility-types';

/** Config module for the `Text` component(s) */
export module TextConfig {
  export module Defaults {
    export const emphasis = 'high' satisfies Emphasis;
    export const tag = 'div' satisfies HTMLTag;
  }

  export type Emphasis = keyof typeof emphasisOpacityMap;

  /** Map of emphasis and the respective (text-)opacity */
  export const emphasisOpacityMap = {
    disabled: 0.38,
    low: 0.6,
    medium: 0.87,
    high: 1.0,
  };

  export type TagMap = DeepPartial<
    Record<TypescaleRole, Record<TypescaleSize, HTMLTag>>
  >;

  /** Map of HTML tags associated to typescale role and sizes */
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
