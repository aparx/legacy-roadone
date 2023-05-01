import type {
  ColorKeyAsElevation,
  ColorKeyWithContainer,
  ColorKeyWithElevation,
  ColorKeyWithInverse,
  ColorKeyWithVariant,
} from '../../color';
import type {
  PalettePrimaryColor,
  PaletteSemanticColor,
} from '../../reference';
import type { UnionOmit, UnionPick } from 'shared-utils/src';

export type SchemeColorSection = Record<
  | ColorKeyWithElevation<SchemeElevationGenerationInput>
  | SchemeApplyKeyContainer<SchemeContainerGenerationInput>
  | SchemeApplyKeyVariant<SchemeVariantsGenerationInput>
  | SchemeApplyKeyInverse<SchemeInverseGenerationInput>
  | SchemeSinglesGenerationInput,
  string
>;

/** Union of all scheme color keys before generation determination */
export type SchemeColorKeyUnion =
  | PalettePrimaryColor
  | PaletteSemanticColor
  | SchemeSpecificKeyUnion;

/** Union of scheme specific keys that are explicitly specific to schemes */
export type SchemeSpecificKeyUnion =
  | 'background'
  | 'surface'
  | 'shadow'
  | 'outline'
  | 'scrim'
  | 'surfaceTint';

export type SchemeApplyKeyContainer<TKey extends SchemeColorKeyUnion> =
  TKey extends SchemeElevationGenerationInput
    ? ColorKeyWithElevation<ColorKeyWithContainer<TKey>>
    : ColorKeyWithContainer<TKey>;

export type SchemeApplyKeyVariant<TKey extends SchemeColorKeyUnion> =
  TKey extends SchemeElevationGenerationInput
    ? ColorKeyWithElevation<ColorKeyWithVariant<TKey>>
    : ColorKeyWithVariant<TKey>;

export type SchemeApplyKeyInverse<TKey extends SchemeColorKeyUnion> =
  TKey extends SchemeElevationGenerationInput
    ? ColorKeyWithElevation<ColorKeyWithInverse<TKey>>
    : ColorKeyWithInverse<TKey>;

// prettier-ignore
/** Extracts every key in the scheme containing given `TKey` as color key. */
export type SchemeExtractByKey<TKey extends SchemeColorKeyUnion> =
  Extract<keyof SchemeColorSection, _SchemeKeyPossibilityUnion<TKey>>;

type _SchemeKeyPossibilityUnion<TKey extends SchemeColorKeyUnion> =
  | ColorKeyWithElevation<TKey>
  | SchemeApplyKeyContainer<TKey>
  | SchemeApplyKeyVariant<TKey>
  | SchemeApplyKeyInverse<TKey>
  | TKey;

/** Union of keys that have a container in the scheme section */
export type SchemeContainerGenerationInput =
  | PalettePrimaryColor
  | PaletteSemanticColor;

/** Union of keys that have elevation in the scheme section */
export type SchemeElevationGenerationInput =
  | SchemeContainerGenerationInput
  | UnionPick<SchemeSpecificKeyUnion, 'background' | 'surface'>;

/** Union of keys that have inverses in the scheme section */
/* prettier-ignore */
export type SchemeInverseGenerationInput = UnionPick<
  SchemeColorKeyUnion,
  PalettePrimaryColor | 'surface'
>;

/** Union of keys that have explicit variants in the scheme section */
/* prettier-ignore */
export type SchemeVariantsGenerationInput = UnionPick<
  SchemeSpecificKeyUnion,
  'surface' | 'outline'
>;

export type SchemeSinglesGenerationInput = UnionOmit<
  SchemeColorKeyUnion,
  | SchemeContainerGenerationInput
  | SchemeElevationGenerationInput
  | SchemeInverseGenerationInput
  | SchemeVariantsGenerationInput
>;
