// TODO simple way to iterate object using paths type-safely (see objectPath.txt)
import type { RecursiveRecord, StringSplit } from './types';

// prettier-ignore
/** Object that can be traversed using property-paths */
export type TraversableObject<TRecordValue = unknown> =
  RecursiveRecord<ObjectPathSegment, TRecordValue>;

export type ObjectPathSegment = string | number;

export type DefaultObjectPathDelimiter = '.';

/** Concatenates `TSegment` and `TOther` if non-null using `TDelimiter`. */
export type PathConcat<
  TSegment extends ObjectPathSegment | undefined,
  TOther extends ObjectPathSegment | undefined,
  TDelimiter extends string = DefaultObjectPathDelimiter
> = TSegment extends undefined
  ? TOther extends undefined
    ? never
    : `${TOther}`
  : TOther extends undefined
  ? `${TSegment}`
  : `${TSegment}${TDelimiter}${TOther}`;

export type ObjectPath<
  TObject extends TraversableObject,
  TDelimiter extends string = DefaultObjectPathDelimiter
> = _ObjectPathBuilder<TObject, TDelimiter, undefined>;

type _ObjectPathBuilder<
  TParent extends TraversableObject,
  TDelimiter extends string,
  /** Current traversed path */
  TLocation extends string | undefined,
  _TKey extends keyof TParent = keyof TParent
> = _TKey extends ObjectPathSegment
  ? TParent[_TKey] extends TraversableObject
    ? _ObjectPathBuilder<
        TParent[_TKey],
        TDelimiter,
        PathConcat<TLocation, _TKey>
      >
    : PathConcat<TLocation, _TKey>
  : never;

export type ResolveObjectPath<
  TObject extends TraversableObject,
  TPath extends ObjectPath<TObject, TDelimiter>,
  TDelimiter extends string = DefaultObjectPathDelimiter
> = _ResolveObjectPath<TObject, StringSplit<TPath, TDelimiter>>;

type _ResolveObjectPath<
  TParent extends TraversableObject,
  TSegments extends ObjectPathSegment[]
> = TSegments extends [
  infer TNext extends ObjectPathSegment,
  ...infer TAfter extends ObjectPathSegment[]
]
  ? TNext extends keyof TParent
    ? TParent[TNext] extends TraversableObject
      ? _ResolveObjectPath<TParent[TNext], TAfter>
      : TAfter extends [any, ...any]
      ? `Error: end of road '${TNext}'`
      : TParent[TNext]
    : `Error: Segment '${TNext}' not found`
  : never;

// const example = {
//   companies: 2,
//   apple: {
//     name: 'Apple',
//     locations: 67124,
//     employees: {
//       roles: ['Manager', 'Salesmen', 'Engineer', 'Designer'],
//       count: 125003,
//     },
//   },
//   samsung: {
//     name: 'Samsung',
//     locations: 26341,
//     employees: {
//       roles: ['Manager', 'Salesmen', 'Engineer', 'Designer'],
//       count: 85612,
//     },
//   },
// } as const satisfies TraversableObject;
//
// type AppleLocations = ResolveObjectPath<typeof example, 'apple.locations'>;
