import type { InternalAvatarProps } from './Avatar';
import { PickOptional } from 'shared-utils';

export module AvatarConfig {
  export const defaults = {
    size: 30,
    name: 'Avatar',
  } as const satisfies Partial<PickOptional<InternalAvatarProps>>;
}
