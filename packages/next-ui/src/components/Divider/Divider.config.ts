import { InternalDividerProps } from './Divider';
import { PickOptionals } from 'shared-utils';

export module DividerConfig {
  export const defaults = {
    thickness: 2,
    orientation: 'horizontal',
    length: '100%',
    emphasis: 'high',
  } satisfies PickOptionals<InternalDividerProps>;
}
