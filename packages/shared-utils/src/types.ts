// prettier-config-ignore
import { DeepPartial } from 'utility-types';

/** Typesafe alternative to Typescript's "Extract" type-utility */
export type UnionExtract<TUnion, TKeys extends TUnion> = TUnion extends TKeys
  ? TUnion
  : never;

// prettier-config-ignore
/** Typesafe alternative to Typescript's "Exclude" type-utility */
export type UnionExclude<TUnion, TKeys extends TUnion> = TUnion extends TKeys
  ? never
  : TUnion;

/** Type that picks `TKeys` from `TObject` into a Record with values of `TValue`. */
export type PickAndReplace<
  TObject extends object,
  TKeys extends keyof TObject,
  TValue = TObject[TKeys]
> = Record<UnionExtract<keyof TObject, TKeys>, TValue>;

// prettier-ignore
export type ValueReplace<TObject extends object, TValue> =
  PickAndReplace<TObject, keyof TObject, TValue>

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
export type PickOptional<TObject extends object> = {
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
export type SplitToTuple<
  TString extends string,
  TDelimiter extends string,
  TFlagReduce extends boolean = false
> = _SplitInArray<TString, TDelimiter, [], TFlagReduce>;

export type SplitToUnion<
  TString extends string,
  TDelimiter extends string,
  TFlagReduce extends boolean = false
> = SplitToTuple<TString, TDelimiter, TFlagReduce>[number];

type _SplitInArray<
  TStr extends string,
  TDel extends string,
  _TBuilt extends string[],
  TFlagReduce extends boolean = false
> = TStr extends `${infer TItem}${TDel}${infer TAfter}`
  ? TFlagReduce extends true
    ?
        | _SplitInArray<TAfter, TDel, [..._TBuilt, TItem], TFlagReduce>
        | [..._TBuilt, TItem]
    : _SplitInArray<TAfter, TDel, [..._TBuilt, TItem], TFlagReduce>
  : [..._TBuilt, TStr];

// prettier-ignore
export type ArrayElement<TArray extends any[]> =
  TArray extends (infer E)[] ? E : never;

export type ArrayLead<
  TArray extends any[],
  TDefault extends ArrayElement<TArray> = never
> = TArray extends [infer TFirst, ...any] ? TFirst : TDefault;

export type ArrayTail<
  TArray extends any[],
  TDefault extends ArrayElement<TArray> = never
> = TArray extends [...any, infer TLast] ? TLast : TDefault;

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

export type RecursiveRecord<TKeys extends PropertyKey, TValue = never> = {
  [P in TKeys]: TValue | RecursiveRecord<TKeys, TValue>;
};

export type PickIntersecting<TObjA extends object, TObjB extends object> = {
  [P in keyof TObjA]: P extends keyof TObjB ? TObjA[P] & TObjB[P] : never;
};

export type DeepCircularOptions = {
  asArray?: boolean;
  partial?: boolean;
  undefinable?: boolean;
  nullable?: boolean;
};

/**
 * Equivalent to `DeepCircularObject` but with the default options of
 * `partial`, `undefinable` and `nullable` set to true.
 * `TOptions` will override the default behaviour.
 */
export type DeepCircularObjectOptional<
  TDeepKey extends PropertyKey,
  TDeepObjectData,
  TOptions extends DeepCircularOptions = {}
> = DeepCircularObject<
  TDeepKey,
  TDeepObjectData,
  ObjectConjunction<
    { partial: true; undefinable: true; nullable: true },
    TOptions
  >
>;

/**
 * Constructs an object, which in itself is self circulating using the `TDeepKey` as
 * the property key, that has the value equal to the parenting object itself.
 * `TOptions` define the value and `TDeepKey` field type-behaviour.
 */
export type DeepCircularObject<
  TDeepKey extends PropertyKey,
  TDeepObjectData,
  TOptions extends DeepCircularOptions = {}
> = TOptions['partial'] extends true
  ? DeepPartial<_BaseObjectDeepSelf<TDeepKey, TDeepObjectData, TOptions>>
  : _BaseObjectDeepSelf<TDeepKey, TDeepObjectData, TOptions>;

type _BaseObjectDeepSelf<
  TDeepKey extends PropertyKey,
  TDeepObjectData,
  TOptions extends Omit<DeepCircularOptions, 'partial'>
> = TDeepObjectData & {
  [P in TDeepKey]: _DeepSelf_Nullish<
    _DeepSelf_AsArray<
      _DeepSelf_Nullish<
        _BaseObjectDeepSelf<TDeepKey, TDeepObjectData, TOptions>,
        TOptions
      >,
      TOptions
    >,
    TOptions
  >;
};

type _DeepSelf_AsArray<
  TObject,
  TOptions extends DeepCircularOptions
> = TOptions['asArray'] extends true ? TObject[] : TObject;

type _DeepSelf_Nullish<TObject, TOptions extends DeepCircularOptions> =
  | TObject
  | (TOptions['nullable'] extends true ? null : never)
  | (TOptions['undefinable'] extends true ? undefined : never);

/**
 * Removes the first element of `TArray` type-wise.
 */
export type ArrayShift<TArray extends any[]> = TArray extends [
  infer TFirst,
  ...infer TRest
]
  ? TRest
  : [];

/**
 * Removes the last element of `TArray` type-wise.
 */
export type ArrayPop<TArray extends any[]> = _ArrayPop<TArray, []>;

type _ArrayPop<TArray extends any[], TBuilt extends any[]> = TArray extends [
  infer TFirst,
  infer TSecond,
  ...infer TRest
]
  ? _ArrayPop<[TSecond, ...TRest], [...TBuilt, TFirst]>
  : TBuilt;
