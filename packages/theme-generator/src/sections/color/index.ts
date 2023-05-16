import { SectionBuilderParent, SectionGenerator } from '../../builder';
import { ElevationGenerator } from './elevation';
import { SchemeGenerator } from './scheme';
import { StateGenerator } from './state';
import { SurfaceGenerator } from './surface';
import { SystemColorSection, Theme } from 'theme-core';

export * from './scheme';
export * from './state';
export * from './surface';

export class ColorGenerator extends SectionGenerator<
  SystemColorSection,
  Theme
> {
  constructor(parent: SectionBuilderParent<SystemColorSection, Theme>) {
    super(parent, undefined);
  }

  async generate(): Promise<this> {
    const scheme = await new SchemeGenerator(this.parent).generate();
    // generate scheme dependants here in parallel
    const dependants = await Promise.all([
      new SurfaceGenerator(this.parent, [scheme]).generate(),
      new StateGenerator(this.parent, [scheme]).generate(),
      new ElevationGenerator(this.parent, [scheme]).generate(),
    ]);
    return this.update({
      scheme: scheme.build(),
      surface: dependants[0].build(),
      state: dependants[1].build(),
      elevation: dependants[2].build(),
    });
  }
}
