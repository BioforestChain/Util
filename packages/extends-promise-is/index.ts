/**
 * @param value
 * @returns
 * @inline
 */
export const isPromiseLike = <T = unknown>(
  value: T | unknown
): value is PromiseLike<Awaited<T>> => {
  return (
    value instanceof Object &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
};

/**
 * @param value
 * @returns
 * @inline
 */
export const isPromise = <T = unknown>(
  value: T | unknown
): value is Promise<Awaited<T>> => {
  return value instanceof Promise;
};
