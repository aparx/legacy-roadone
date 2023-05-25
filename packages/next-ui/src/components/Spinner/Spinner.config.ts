import { SpinnerData } from './Spinner';

export module SpinnerConfig {
  export const defaults = {
    size: 30,
    color: (t) => t.sys.color.scheme.onSurface,
    speed: 1,
  } satisfies SpinnerData;
}
