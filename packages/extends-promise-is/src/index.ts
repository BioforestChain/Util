export const isPromiseLike = <T = unknown>(
  value: T | unknown,
): value is PromiseLike<Awaited<T>> => {
  return typeof value === "object" && value !== null && typeof (value as any).then === "function";
};
export const isPromise = <T = unknown>(value: T | unknown): value is Promise<Awaited<T>> => {
  return value instanceof Promise;
};

<T>(value: T | PromiseLike<T>) => {
  if (isPromiseLike(value)) {
    value;
  } else {
    value;
  }
};
