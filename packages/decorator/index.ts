///<reference lib="dom" />
export * from "./bindThis.ts";
export * from "./cacheGetter.ts";
export * from "./expirableCacheGetter.ts";
export * from "./PropArrayHelper.ts";
export * from "./throttleWrap.ts";
export * from "./quene.ts";

export function ClassStaticImplement<T>() {
  return <U extends T>(constructor: U) => constructor;
}
