import type { InternalGigGroupProps } from '@/modules/gigs/components/GigGroup/GigGroup';
import { PickOptionals } from 'shared-utils';

export module GigGroupConfig {
  export const defaults = {
    width: 'md',
  } satisfies PickOptionals<InternalGigGroupProps>;
}
