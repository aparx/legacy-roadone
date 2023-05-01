export type TypefaceSection = {
  base: { fontSize: number };
  weights: Record<TypefaceWeight, number>;
} & Record<TypefaceRole, TypefaceFamily>;

export type TypefaceFamily = (typeof typefaceFamilyArray)[number];

export const typefaceFamilyArray = ['roboto'] as const;

export type TypefaceRole = (typeof typefaceRoleArray)[number];

export const typefaceRoleArray = ['brand', 'plain'] as const;

export type TypefaceWeight = (typeof typefaceWeightArray)[number];

// prettier-ignore
export const typefaceWeightArray = [
  'regular', 'medium', 'strong', 'heavy'
] as const;
