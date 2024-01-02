import type { InternalGigGroupProps } from '@/modules/gigs/components/GigGroup/GigGroup';
import { PickOptional } from 'shared-utils';

export module GigGroupConfig {
  export const defaults = {
    width: 'md',
  } satisfies PickOptional<InternalGigGroupProps>;
}