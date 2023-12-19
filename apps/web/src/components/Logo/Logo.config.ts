import { LogoProps } from '@/components/Logo/Logo';
import { PickOptional } from 'shared-utils';

export module LogoConfig {
  export const defaults = {
    variant: 'block',
  } as const satisfies Partial<PickOptional<LogoProps>>;
}
