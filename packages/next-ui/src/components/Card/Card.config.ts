import { HTMLTag } from '../../utils';
import { InternalCardProps } from './Card';
import { PickOptional } from 'shared-utils';

export module CardConfig {
  export const defaults = {
    width: 'md',
  } as const satisfies Partial<PickOptional<InternalCardProps>>;

  export module Defaults {
    export const tag = 'div' satisfies HTMLTag;
  }
}
