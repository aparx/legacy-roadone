import { TypescalePinpoint } from 'theme-core';

export module IconConfig {
  /** HTML attribute applied to an Icon's wrapper, representing `identify`. */
  export const identifyHTMLAttribute = 'data-icon-id';

  export module Defaults {
    export const font = {
      role: 'body',
      size: 'md',
    } satisfies TypescalePinpoint;
  }
}
