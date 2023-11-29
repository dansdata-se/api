import z from "@/api/zod";

export const PagedDataDtoSchema = <TData extends z.ZodTypeAny>(data: TData) =>
  z
    .object({
      data: z.array(data).min(0),
    })
    .describe(
      `Represents a page in a data set.

Note: the number of items per page is determined by the server in order to
increase the likelyhood of a cache hit. Clients MUST NOT expect this page
size to remain constant - not even for the same deployment of this API.
`
    );

export const KeyPagedDataDtoSchema = <
  TData extends z.ZodTypeAny,
  TKey extends z.ZodTypeAny,
>(
  data: TData,
  nextPageKeySchema: TKey
) =>
  PagedDataDtoSchema(data).merge(
    z.object({
      nextPageKey: nextPageKeySchema.nullable().describe(
        `A key used by the server to resolve the next page of results, or \`null\` if there are no more results.

Note: clients MUST NOT make assumptions regarding the format or meaning
of this field as these may change without notice, at any time.
`
      ),
    })
  );

export const KeyPagedParametersSchema = <TKey extends z.ZodTypeAny>(
  pageKeySchema: TKey
) =>
  z.object({
    pageKey: pageKeySchema.optional().describe(
      `A key used by the server to resolve the page of results.

If this parameter is unset, the first page of results will be returned.

The server will return a key in its response that can be used to
retrieve the next page.
`
    ),
  });
