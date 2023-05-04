// prettier-config-ignore
/** Typesafe alternative to Typescript's "Extract" type-utility */
export type UnionPick<TUnion, TKeys extends TUnion> = TUnion extends TKeys
  ? TUnion
  : never;

// prettier-config-ignore
/** Typesafe alternative to Typescript's "Exclude" type-utility */
export type UnionOmit<TUnion, TKeys extends TUnion> = TUnion extends TKeys
  ? never
  : TUnion;

// prettier-ignore
export type TupleContains<TTuple, TElement> =
  TTuple extends [infer A, ...infer B]
  ? A extends TElement
    ? true
    : TupleContains<B, TElement>
  : false;

// prettier-config-ignore
export type TupleOf<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;

// prettier-config-ignore
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export type WithArray<TElement> = TElement | TElement[];
