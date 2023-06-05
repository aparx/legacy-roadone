import { z, ZodObject, ZodType } from 'zod';

export const infiniteQueryInput = createInfiniteQueryInput(50);

export function createInfiniteQueryInput(max: number, def: number = max / 2) {
  max = Math.round(max);
  def = Math.round(def);
  return z.object({
    cursor: z.number().int().min(0).finite().default(0),
    limit: z.number().int().positive().max(max).default(def),
  });
}

export function createInfiniteQueryOutput<
  TElementSchema extends ZodType,
  TRestSchema extends ZodObject<any>
>(
  element: TElementSchema,
  rest?: TRestSchema
): z.ZodType<
  GetInfiniteQueryResult<z.infer<TElementSchema>, z.infer<TRestSchema>>
> {
  const output = z.object({
    data: element.array(),
    thisCursor: z.number(),
    nextCursor: z.number().optional(),
  }) satisfies z.ZodType<GetInfiniteQueryResult<z.infer<TElementSchema>>>;
  if (!rest) return output as any;
  return rest.extend(output.shape) as any;
}

export type InfiniteQueryInput = z.infer<typeof infiniteQueryInput>;

export type GetInfiniteQueryResult<
  TDataElement,
  TRestQueryResult extends object = {}
> = Omit<TRestQueryResult, keyof GetInfiniteQueryInput<TDataElement>> & {
  data: TDataElement[];
  thisCursor: number;
  nextCursor?: number | undefined;
};

type GetInfiniteQueryInput<
  TDataElement,
  TRestQueryResult extends object = {}
> = TRestQueryResult & {
  infiniteData: TDataElement[] | undefined | null;
};

export function createInfiniteQueryResult<
  TDataElement,
  TRestQueryResult extends object = {}
>(
  { cursor, limit }: InfiniteQueryInput,
  data: GetInfiniteQueryInput<TDataElement, TRestQueryResult>
): GetInfiniteQueryResult<TDataElement, TRestQueryResult> {
  const { infiniteData, ...rest } = data;
  let nextCursor: GetInfiniteQueryResult<any>['nextCursor'];
  if (infiniteData && infiniteData.length > limit) {
    infiniteData.splice(limit);
    nextCursor = cursor + limit;
  }
  return {
    thisCursor: cursor,
    nextCursor,
    ...(rest as TRestQueryResult),
    data: infiniteData ?? [],
  };
}
