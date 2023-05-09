import type {
  ColorKeyWithContainer,
  ColorKeyWithElevation,
  ColorKeyWithInverse,
  ColorKeyWithVariant,
} from '../../color';
import type {
  PalettePrimaryColor,
  PaletteSemanticColor,
} from '../../reference';
import type { UnionExclude, UnionExtract } from 'shared-utils/src';

export type SchemeColorSection = Record<
  | ColorKeyWithElevation<SchemeElevationColorInput>
  | SchemeApplyKeyContainer<SchemeContainerColorInput>
  | SchemeApplyKeyVariant<SchemeVariantsColorInput>
  | SchemeApplyKeyInverse<SchemeInverseColorInput>
  | SchemeSinglesColorInput,
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
  TKey extends SchemeElevationColorInput
    ? ColorKeyWithElevation<ColorKeyWithContainer<TKey>>
    : ColorKeyWithContainer<TKey>;

export type SchemeApplyKeyVariant<TKey extends SchemeColorKeyUnion> =
  TKey extends SchemeElevationColorInput
    ? ColorKeyWithElevation<ColorKeyWithVariant<TKey>>
    : ColorKeyWithVariant<TKey>;

export type SchemeApplyKeyInverse<TKey extends SchemeColorKeyUnion> =
  TKey extends SchemeElevationColorInput
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
export type SchemeContainerColorInput =
  | PalettePrimaryColor
  | PaletteSemanticColor;

/** Union of keys that have elevation in the scheme section */
export type SchemeElevationColorInput =
  | SchemeContainerColorInput
  | UnionExtract<SchemeSpecificKeyUnion, 'background' | 'surface'>;

/** Union of keys that have inverses in the scheme section */
/* prettier-ignore */
export type SchemeInverseColorInput = UnionExtract<
  SchemeColorKeyUnion,
  PalettePrimaryColor | 'surface'
>;

/** Union of keys that have explicit variants in the scheme section */
/* prettier-ignore */
export type SchemeVariantsColorInput = UnionExtract<
  SchemeSpecificKeyUnion,
  'surface' | 'outline'
>;

export type SchemeSinglesColorInput = UnionExclude<
  SchemeColorKeyUnion,
  | SchemeContainerColorInput
  | SchemeElevationColorInput
  | SchemeInverseColorInput
  | SchemeVariantsColorInput
>;
