import { SectionDependency, SectionGenerator } from '../../builder';
import { colord } from 'colord';
import { ElevationColorSection, SchemeColorSection, Theme } from 'theme-core';

export class ElevationGenerator extends SectionGenerator<
  ElevationColorSection,
  Theme,
  [SectionDependency<SchemeColorSection>]
> {
  generate(): Promise<this> {
    const scheme = this.dependencies[0].build();
    const base = colord(scheme.shadow);
    return this.update([
      scheme.surface,
      base.alpha(0.2).toHex(),
      base.alpha(0.3).toHex(),
      base.alpha(0.5).toHex(),
      base.alpha(0.7).toHex(),
      base.alpha(0.9).toHex(),
    ]);
  }
}
