import { SectionGenerator, SectionBuilderParent } from '../../builder';
import { capitalize } from 'lodash';
import {
  palettePrimaryArray,
  PalettePrimaryColor,
  SchemeColorSection,
  SchemeExtractByKey,
  Theme,
} from 'theme-core';

export class SchemeGenerator extends SectionGenerator<
  SchemeColorSection,
  Theme
> {
  constructor(parent: SectionBuilderParent<SchemeColorSection, Theme>) {
    super(parent, undefined);
  }

  generate(): Promise<this> {
    const root = this.root();
    const { palette } = root.reference();
    let primaryData: Pick<
      SchemeColorSection,
      SchemeExtractByKey<PalettePrimaryColor>
    > = {} as any;
    for (const key of palettePrimaryArray) {
      const bigKey = capitalize(key) as Capitalize<typeof key>;
      primaryData[key] = palette[key][80];
      primaryData[`${key}Container`] = palette[key][30];
      primaryData[`on${bigKey}`] = palette[key][20];
      primaryData[`on${bigKey}Container`] = palette[key][90];
      primaryData[`inverse${bigKey}`] = palette[key][40];
      primaryData[`inverseOn${bigKey}`] = palette[key][90];
    }
    return this.update({
      ...primaryData,
      outline: palette.neutralVariant[60],
      outlineVariant: palette.neutralVariant[30],
      background: palette.neutral[10],
      onBackground: palette.neutral[90],
      surface: palette.neutral[10],
      onSurface: palette.neutral[80],
      surfaceVariant: palette.neutralVariant[30],
      onSurfaceVariant: palette.neutralVariant[90],
      inverseSurface: palette.neutral[90],
      inverseOnSurface: palette.neutral[10],
      surfaceTint: palette.primary[80],
      error: palette.error[80],
      onError: palette.error[20],
      errorContainer: palette.error[30],
      onErrorContainer: palette.error[90],
      shadow: palette.neutral[0],
      scrim: palette.neutral[0],
    });
  }
}
