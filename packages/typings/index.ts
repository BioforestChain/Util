export * from "./$types.ts";
export * from "./global.ts";
/**
 * @inline
 */
export const $ignoreAwait = (_promise: unknown) => {
  void _promise;
};

/**
 * @inline
 */
export const $shouldNever = (_val: never) => {};
/**
 * @inline
 */
export const $safeEnd = (() => {}) as unknown as (val: never) => never;
