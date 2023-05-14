// prettier-config-ignore
/** Typesafe alternative to Typescript's "Extract" type-utility */
export type UnionExtract<TUnion, TKeys extends TUnion> = TUnion extends TKeys
  ? TUnion
  : never;

// prettier-config-ignore
/** Typesafe alternative to Typescript's "Exclude" type-utility */
export type UnionExclude<TUnion, TKeys extends TUnion> = TUnion extends TKeys
  ? never
  : TUnion;

// prettier-ignore
export type TupleContains<TTuple, TElement> =
  TTuple extends [infer A, ...infer B]
  ? A extends TElement
    ? true
    : TupleContains<B, TElement>
  : false;

export type TupleOf<
  TElement,
  TLength extends number = 0
> = TLength extends TLength
  ? number extends TLength
    ? TElement[]
    : _TupleOf<TElement, TLength, []>
  : never;

type _TupleOf<
  TElement,
  TLength extends number,
  _TBuilt extends unknown[]
> = _TBuilt['length'] extends TLength
  ? _TBuilt
  : _TupleOf<TElement, TLength, [TElement, ..._TBuilt]>;

/**
 * Returns `TElement` as union with itself as an array.
 */
export type WithArray<TElement> = TElement | TElement[];

/**
 * Picks all properties of `TObject` that are optional.
 * Returns an object of all properties and values of `TObject`, where property `P` is
 * optional, otherwise omits it.
 */
export type PickOptionals<TObject extends object> = {
  [P in _ExtractOptionals<TObject>]: TObject[P];
};

type _ExtractOptionals<TObject extends object> = Exclude<
  {
    [K in keyof TObject]: TObject extends Record<K, TObject[K]> ? never : K;
  }[keyof TObject],
  undefined
>;

/**
 * Splits `TString` using given `TDelimiter` as the separator. Returns a tuple.
 */
// prettier-ignore
export type Split<TString extends string, TDelimiter extends string> =
  _Split<TString, TDelimiter, []>;

type _Split<
  TStr extends string,
  TDel extends string,
  _TBuilt extends string[]
> = TStr extends `${infer TItem}${TDel}${infer TAfter}`
  ? _Split<TAfter, TDel, [..._TBuilt, TItem]>
  : [..._TBuilt, TStr];

/**
 * (Similarly) Equivalent to `ObjectConjunction`, but more verbose.
 */
export type MultiObjectConjunction<TObjects extends [object, any, ...any]> =
  TObjects extends [infer TObject extends object, ...infer TOverrides]
    ? ObjectConjunction<TObject, TOverrides>
    : never;

/**
 * Overrides `TOverride` in `TObject`, whereas `TOverride` can also be an array, to
 * represent multiple (type) sequential overrides.
 */
export type ObjectConjunction<
  TObject extends object,
  TOverride
> = TOverride extends any[]
  ? _ConjunctionOmitBuild<TObject, TOverride>
  : TOverride & _ConjunctionOmit<TObject, TOverride>;

type _ConjunctionOmit<TObject, TOmit> = TOmit extends object
  ? Omit<TObject, keyof TOmit>
  : TOmit extends PropertyKey
  ? Omit<TObject, TOmit>
  : TObject;

type _ConjunctionOmitBuild<
  TObject,
  TOverrides,
  _TBuilt = TObject
> = TOverrides extends [infer A, ...infer B]
  ? _ConjunctionOmitBuild<_TBuilt, B, A & _ConjunctionOmit<_TBuilt, A>>
  : _TBuilt;
