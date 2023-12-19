import { ToastData } from '@/components/Toast/Toast';
import { ScrimConfig } from 'next-ui';
import { PickOptional } from 'shared-utils';

export module ToastConfig {
  export const zIndex = 99 + ScrimConfig.zIndex;

  export const defaults = {
    duration: 'normal',
  } as const satisfies Partial<PickOptional<ToastData>>;
}
