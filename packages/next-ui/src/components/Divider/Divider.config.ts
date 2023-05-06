import { DividerData } from './Divider';

export module DividerConfig {
  export const defaults = {
    length: '100%',
    thickness: 2,
    orientation: 'horizontal',
  } satisfies Required<DividerData>;
}
