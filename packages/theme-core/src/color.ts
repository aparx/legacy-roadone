export type ColorKeyAsVariant<TKey extends string> =
  `${Uncapitalize<TKey>}Variant`;

export type ColorKeyAsContainer<TKey extends string> =
  `${Uncapitalize<TKey>}Container`;

export type ColorKeyAsInverse<TKey extends string> =
  `inverse${Capitalize<TKey>}`;

export type ColorKeyAsElevation<TKey extends string> =
  TKey extends `inverse${infer _TKey}`
    ? `inverse${Capitalize<ColorKeyAsElevation<_TKey>>}`
    : `on${Capitalize<TKey>}`;

export type ColorKeyWithVariant<TKey extends string> =
  | TKey
  | ColorKeyAsVariant<TKey>;

export type ColorKeyWithContainer<TKey extends string> =
  | TKey
  | ColorKeyAsContainer<TKey>;

export type ColorKeyWithInverse<TKey extends string> =
  | TKey
  | ColorKeyAsInverse<TKey>;

export type ColorKeyWithElevation<TKey extends string> =
  | TKey
  | ColorKeyAsElevation<TKey>;
