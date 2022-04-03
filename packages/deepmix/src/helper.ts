/**对象是否可以混合，除了object，其它都不行（array，function，Map，Set，ArrayBufferLike等待） */
export function mergeAble<V>(value: V) {
  return (typeof value === "object" &&
    value !== null &&
    !(Symbol.iterator in value)) as unknown as MergeAble<V>;
}
export type MergeAble<V> = V extends object
  ? V extends { [Symbol.iterator]: unknown }
    ? never
    : V
  : never;
