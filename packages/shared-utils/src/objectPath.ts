import type { RecursiveRecord, SplitToTuple, SplitToUnion } from './types';

// <==================================>
//       MAIN OBJECT-PATH TYPES
// <==================================>

/** Non-specific property key that can be used to represent a path segment. */
export type GenericPathSegment = string | number;

/** Equivalent to union with `GenericPathSegment`, but undefinable. */
type _OptPathSeg = GenericPathSegment | undefined;

// prettier-ignore
/** Object of which all keys are `GenericPathSegment`s. */
export type TraversableObject<TValues = unknown> =
  RecursiveRecord<GenericPathSegment, TValues>;

/** Returns the values used in `TObject` if it is a `TraversableObject`. */
export type InferTraversableValues<TObject extends object> =
  TObject extends TraversableObject<infer TValues> ? TValues : any;

export type DefaultPathDelimiter = '.';

/** Concatenates `TSegment` and `TAppend` if defined using `TDelimiter`. */
export type PathConcat<
  TSegment extends _OptPathSeg,
  TAppend extends _OptPathSeg,
  TDelimiter extends string = DefaultPathDelimiter
> = TSegment extends undefined
  ? TAppend extends undefined
    ? never
    : `${TAppend}`
  : TAppend extends undefined
  ? `${TSegment}`
  : `${TSegment}${TDelimiter}${TAppend}`;

/** Union of possible paths to all valid leaves in `TObject`, using `TDelimiter`. */
export type ObjectPath<
  TObject extends TraversableObject<TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TObject>
> = _ObjectPath<TObject, TDelimiter, undefined, TLeavesOnly, TValues>;

/** `ObjectPath` that only allows for leaves to be referenced. */
export type LeafObjectPath<
  TObject extends TraversableObject<TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TValues = InferTraversableValues<TObject>
> = ObjectPath<TObject, TDelimiter, true, TValues>;

/** `ObjectPath` that also allows for non-leaves to be referenced. */
export type AnyObjectPath<
  TObject extends TraversableObject<TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TValues = InferTraversableValues<TObject>
> = ObjectPath<TObject, TDelimiter, false, TValues>;

type _ObjectPath<
  TNode extends TraversableObject<TValues>,
  TDelimiter extends string,
  TLocation extends string | undefined,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TNode>,
  _TKey extends keyof TNode = keyof TNode
> = _TKey extends GenericPathSegment
  ? TNode[_TKey] extends TraversableObject<TValues>
    ?
        | _ObjectPath<
            TNode[_TKey],
            TDelimiter,
            PathConcat<TLocation, _TKey, TDelimiter>,
            TLeavesOnly,
            TValues
          >
        | (TLeavesOnly extends false
            ? PathConcat<TLocation, _TKey, TDelimiter>
            : never)
    : PathConcat<TLocation, _TKey, TDelimiter>
  : never;

// <==================================>
//        OBJECT-PATH RESOLVING
// <==================================>

export type ResolveObjectPath<
  TObject extends TraversableObject<TValues>,
  TPath extends ObjectPath<TObject, TDelimiter, TLeavesOnly, TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TObject>
> = _ResolveObjectPath<
  TObject,
  SplitToTuple<TPath, TDelimiter>,
  TLeavesOnly,
  TValues
>;

type _ResolveObjectPath<
  TNode extends TraversableObject<TValues>,
  TSegments extends GenericPathSegment[],
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TNode>
> = TSegments extends [
  infer TNext extends GenericPathSegment,
  ...infer TAfter extends GenericPathSegment[]
]
  ? TNext extends keyof TNode
    ? TNode[TNext] extends TraversableObject<TValues>
      ? _ResolveObjectPath<TNode[TNext], TAfter, TLeavesOnly, TValues>
      : TAfter extends []
      ? TNode[TNext]
      : never
    : never
  : never;

export type ResolvePathErrorHandler<
  TObject extends TraversableObject<TValues>,
  TPath extends ObjectPath<TObject, TDelimiter, TLeavesOnly, TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TObject>
> = (
  data: ResolvePathErrorData<TObject, TPath, TDelimiter, TLeavesOnly, TValues>
) => undefined | never | void;

export type ResolvePathErrorCode = 'NOT_FOUND' | 'NOT_A_LEAF';

export type ResolvePathErrorData<
  TObject extends TraversableObject<TValues>,
  TPath extends ObjectPath<TObject, TDelimiter, TLeavesOnly, TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TObject>
> = Omit<
  ResolvePathInput<TObject, TPath, TDelimiter, TLeavesOnly, TValues>,
  'onError'
> & {
  code: ResolvePathErrorCode;
  errorPath: SplitToTuple<TPath, TDelimiter, true>;
  errorSegment: SplitToUnion<TPath, TDelimiter>;
};

export type ResolvePathInput<
  TObject extends TraversableObject<TValues>,
  TPath extends ObjectPath<TObject, TDelimiter, TLeavesOnly, TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TObject>
> = {
  object: TObject;
  path: TPath;
  delimiter: TDelimiter;
  /** If true only allows leaf properties (so non-object values) to be referenced. */
  leavesOnly: TLeavesOnly;
  onError?: ResolvePathErrorHandler<
    TObject,
    TPath,
    TDelimiter,
    TLeavesOnly,
    TValues
  >;
};

export type ResolvePathOutput<
  TObject extends TraversableObject<TValues>,
  TPath extends ObjectPath<TObject, TDelimiter, TLeavesOnly, TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TObject>
> =
  | ResolveObjectPath<TObject, TPath, TDelimiter, TLeavesOnly, TValues>
  | undefined
  | never;

export function resolvePath<
  TObject extends TraversableObject<TValues>,
  TPath extends ObjectPath<TObject, TDelimiter, TLeavesOnly, TValues>,
  TDelimiter extends string = DefaultPathDelimiter,
  TLeavesOnly extends boolean = true,
  TValues = InferTraversableValues<TObject>
>(
  input: ResolvePathInput<TObject, TPath, TDelimiter, TLeavesOnly, TValues>
): ResolvePathOutput<TObject, TPath, TDelimiter, TLeavesOnly, TValues> {
  const { onError, ...data } = input;
  // prettier-ignore
  const segments = (input.path as string).split(input.delimiter);
  let tail: unknown = input.object;
  let i = 0;
  for (; i < segments.length; ++i) {
    if (!tail || typeof tail !== 'object' || Array.isArray(tail)) break; /*ERR*/
    const segment = segments[i] as SplitToUnion<TPath, TDelimiter>;
    if (!((segment as string) in tail)) break; /*ERR*/
    tail = (tail as any)[segment];
  }
  const errorCode: ResolvePathErrorCode | false =
    i !== segments.length
      ? 'NOT_FOUND'
      : !Array.isArray(tail) && typeof tail === 'object' && input.leavesOnly
      ? 'NOT_A_LEAF'
      : false;
  if (errorCode) {
    // prettier-ignore
    return input.onError?.({
      ...data,
      code: errorCode,
      errorSegment: segments[i - 1] as any,
      errorPath: segments.splice(0, i) as any,
    }) ?? undefined;
  }
  return tail as any;
}
