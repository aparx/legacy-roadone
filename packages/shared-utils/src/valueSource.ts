export type ValueSource<
  TValue,
  TArgs extends any[] = []
> = TValue extends Function
  ? ValueSupplier<TValue, TArgs>
  : TValue | ValueSupplier<TValue, TArgs>;

// prettier-ignore
export type ValueSupplier<TSource, TArgs extends any[] = []>
  = (...args: TArgs) => TSource;

export type InferValueSupplierArgs<TSource extends any & {}> =
  TSource extends ValueSupplier<any, infer _TArgs> ? _TArgs : never;

export type InferValueSupplierValue<TSource extends any & {}> =
  TSource extends ValueSupplier<infer _TValue, any> ? _TValue : never;

export function resolveSource<TSource extends ValueSource<any, any>>(
  source: TSource,
  ...args: InferValueSupplierArgs<TSource>
): InferValueSupplierValue<TSource> {
  if (typeof source === 'function') return source(...args);
  return source as InferValueSupplierValue<TSource>;
}
