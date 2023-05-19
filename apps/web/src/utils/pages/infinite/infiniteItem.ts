/** An infinite-item is something like a `Gig` or `BlogPost`, that can be added,
 *  edited and deleted - primarily with a specific permission. */
export type InfiniteItem<TItem> = {
  item: TItem;
};

type _InferItemMutation<TKey extends string> = TKey extends `on${infer TCap}`
  ? Uncapitalize<TCap>
  : never;

export type InfiniteItemEvents<TItem> = {
  [P in `on${Capitalize<InfiniteItemMutation>}`]: _InferItemMutation<P>;
};

/** Ways of mutating an infinite item; all required in `InfiniteItemEvents`. */
export type InfiniteItemMutation = 'edit' | 'delete' | 'add';

export type InfiniteItemMutateArgs<
  TType extends InfiniteItemMutation,
  TItem extends object
> = TType extends 'add' ? [] : [item: InfiniteItem<TItem>];

export type InfiniteItemMutateFunction<
  TType extends InfiniteItemMutation,
  TItem extends object
> = (...args: InfiniteItemMutateArgs<TType, TItem>) => any;
