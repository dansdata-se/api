export type Defined<T> = T extends undefined ? never : T;

export function isDefined<T>(value: T | undefined): value is Defined<T> {
  return value !== undefined;
}

export function isNonNull<T>(
  value: T | undefined | null
): value is NonNullable<T> {
  return isDefined(value) && value !== null;
}
