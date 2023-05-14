import type { TypefaceRole, TypefaceWeight } from '../reference';

export type TypescaleSection = Record<TypescaleRole, TypescaleSizeMap>;

export type TypescaleSizeMap = Record<TypescaleSize, TypescaleData>;

export type TypescaleRole = (typeof typescaleRoleArray)[number];

// prettier-ignore
export const typescaleRoleArray = [
  'display', 'headline', 'title', 'body', 'label',
] as const;

export type TypescaleSize = 'lg' | 'md' | 'sm';

export type TypescaleData = {
  fontFamily: TypefaceRole;
  fontWeight: TypefaceWeight;
  fontSize: number;
  lineHeight?: number;
  letterSpacing?: number;
};

/** Type that can pinpoint specific `TypescaleData` using given properties */
export type TypescalePinpoint = {
  role: TypescaleRole;
  size: TypescaleSize;
};
