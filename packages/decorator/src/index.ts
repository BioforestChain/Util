///<reference lib="dom" />
export * from "./bindThis";
export * from "./cacheGetter";
export * from "./expirableCacheGetter";
export * from "./PropArrayHelper";
export * from "./throttleWrap";
export * from "./quene";

export function ClassStaticImplement<T>() {
  return <U extends T>(constructor: U) => constructor;
}
