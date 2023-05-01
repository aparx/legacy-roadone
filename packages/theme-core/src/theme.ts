import type { ReferenceSection } from './reference';
import { NamedMultiplierMap, RuntimeSection } from './runtime';
import type { SystemSection } from './system';

/** Interface that generally represents a `Theme` that can be serialized. */
export interface Theme {
  ref: ReferenceSection;
  sys: SystemSection;
}

/** Interface representing a partially non-serializable version of `Theme`, containing
 *  runtime data and utilities further enhancing the DX (Developer Experience). */
export interface RuntimeTheme<TMultiplierNameMap extends NamedMultiplierMap>
  extends Theme {
  rt: RuntimeSection<TMultiplierNameMap>;
}
