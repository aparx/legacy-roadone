import { SectionDependency, SectionGenerator } from '../../builder';
import { normal } from 'color-blend';
import { colord, Colord } from 'colord';
import { SchemeColorSection, SurfaceColorSection, Theme } from 'theme-core';

export class SurfaceGenerator extends SectionGenerator<
  SurfaceColorSection,
  Theme,
  [SectionDependency<SchemeColorSection>]
> {
  generate(): Promise<this> {
    const scheme = this.dependencies[0].build();
    const surfaceTint = colord(scheme.surfaceTint);
    const surface = colord(scheme.surface);
    return this.update([
      scheme.surface,
      this.tint(surface, surfaceTint, 0.05),
      this.tint(surface, surfaceTint, 0.08),
      this.tint(surface, surfaceTint, 0.11),
      this.tint(surface, surfaceTint, 0.12),
      this.tint(surface, surfaceTint, 0.14),
    ]);
  }

  tint(backdrop: Colord, tint: Colord, alpha: number) {
    return colord(normal(backdrop.toRgb(), tint.alpha(alpha).toRgb())).toHex();
  }
}
