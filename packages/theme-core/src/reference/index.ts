import type { DynamicSection } from './dynamic';
import type { PaletteSection } from './palette';
import type { TypefaceSection } from './typeface';

export * from './typeface';
export * from './dynamic';
export * from './palette';

export interface ReferenceSection extends DynamicSection {
  typeface: TypefaceSection;
  palette: PaletteSection;
}
