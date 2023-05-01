import type { ColorKeyWithVariant } from '../color';

export type PaletteSection = Record<
  | PalettePrimaryColor
  | PaletteSemanticColor
  | ColorKeyWithVariant<PaletteNeutralColor>,
  PaletteTonalMap
>;

export type PaletteTonalMap = Record<PaletteTonalIndex, string>;

export type PalettePrimaryColor = (typeof palettePrimaryArray)[number];

/* prettier-ignore */
export const palettePrimaryArray = [
  'primary', 'secondary', 'tertiary'
] as const;

export type PaletteSemanticColor = 'error';

export type PaletteNeutralColor = 'neutral';

/* prettier-ignore */
export type PaletteTonalIndex = (typeof paletteTonalIndexArray)[number];

export const paletteTonalIndexArray = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100,
] as const;
