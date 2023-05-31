import { z, ZodObject, ZodType } from 'zod';

export const infiniteQueryInput = z.object({
  cursor: z.number().int().default(0),
  limit: z.number().max(50).default(30),
});

export function infiniteQueryOutput<
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
  });
  if (!rest) return output;
  return rest.extend(output.shape) as any;
}

export type InfiniteQueryInput = z.infer<typeof infiniteQueryInput>;

export type GetInfiniteQueryResult<
  TDataElement,
  TRestQueryResult extends object = {}
> = Omit<TRestQueryResult, keyof GetInfiniteQueryInput<TDataElement, any>> & {
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

export function createGetInfiniteQueryResult<
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
