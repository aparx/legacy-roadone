import { SectionDependency, SectionGenerator } from '../../builder';
import { colord } from 'colord';
import { capitalize } from 'lodash';
import type {
  MultiStateKeyUnion,
  SchemeColorSection,
  StateColorSection,
  Theme,
} from 'theme-core';
import { multiStateKeyArray } from 'theme-core';

export class StateGenerator extends SectionGenerator<
  StateColorSection,
  Theme,
  [SectionDependency<SchemeColorSection>]
> {
  async generate(): Promise<this> {
    const scheme = this.dependencies[0].build();
    let multi: Pick<StateColorSection, MultiStateKeyUnion> = {} as any;
    for (const key of multiStateKeyArray) {
      const bigKey = capitalize(key) as Capitalize<typeof key>;
      const base = colord(
        bigKey === 'Surface'
          ? scheme['onSurfaceVariant']
          : scheme[`on${bigKey}Container`]
      );
      multi[key] = {
        light: base.alpha(0.08).toHex(),
        medium: base.alpha(0.12).toHex(),
        strong: base.alpha(0.16).toHex(),
      };
    }
    return this.update({
      ...multi,
      disabled: colord(scheme.onSurface).alpha(0.12).toHex(),
    });
  }
}
