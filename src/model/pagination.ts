/**
 * Represents a page in a data set
 */
export interface PagedDataModel<TData> {
  data: TData[];
}

/**
 * Represents a page in a data set paginated based on a key
 */
export interface KeyPagedDataModel<TData, TKey> extends PagedDataModel<TData> {
  /**
   * The next key to retrieve in the data set - or `null` if there is no more data.
   */
  nextPageKey: TKey | null;
}

export interface KeyPagedParameterModel<TKey> {
  /**
   * The first key to retrieve in the data set - or `null` to retrieve the first page of data.
   */
  pageKey: TKey | null;
}
