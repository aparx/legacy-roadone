import { UI } from '../../utils';
import type { InternalSkeletonProps } from './Skeleton';
import { PickOptional } from 'shared-utils';

export module SkeletonConfig {
  export const defaults = {
    width: '100%',
    height: 50,
    roundness: UI.generalRoundness,
    baseColor: 'transparent',
    scanColor: (t) => t.sys.color.scheme.primary,
  } satisfies Partial<PickOptional<InternalSkeletonProps>>;
}
