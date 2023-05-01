import {
  SectionDataMergePriority,
  SectionGenerator,
  ThemeBuilder,
  ThemeGeneratorInput,
} from '../builder';
import { ColorGenerator } from './color';
import { TypescaleGenerator } from './typescale';
import { cloneDeep } from 'lodash';
import type { ReferenceSection, SystemSection, Theme } from 'theme-core';
import { DeepPartial } from 'utility-types';

export * from './color';
export * from './typescale';

export class ThemeGenerator
  extends SectionGenerator<Theme>
  implements ThemeBuilder
{
  constructor(
    private readonly _initial: ThemeGeneratorInput,
    private _generationMergePriority: SectionDataMergePriority = 'fresh'
  ) {
    super(undefined, undefined, cloneDeep(_initial));
  }

  /**
   * Changes the prioritisation with the final migration operation when generating.
   * If `newDataPriority` is set to `fresh`, when `generate` is finishing, the new
   * index data will (deeply) override the current, `present`, index data.
   *
   * @param newDataPriority the new merge-priority for new "generate" operations
   */
  prioritise(newDataPriority: SectionDataMergePriority): this {
    this._generationMergePriority = newDataPriority;
    return this;
  }

  async generate(): Promise<this> {
    const data = await Promise.all([
      new ColorGenerator(this).generate(),
      new TypescaleGenerator(this).generate(),
    ]);
    return this.merge(
      {
        sys: {
          color: data[0].build(),
          typescale: data[1].build(),
        },
      },
      this._generationMergePriority
    );
  }

  input(): ThemeGeneratorInput {
    return this._initial;
  }

  reference(): ReferenceSection {
    return this._initial.ref;
  }

  system(): DeepPartial<SystemSection> {
    return (this.current().sys ??= {});
  }
}
