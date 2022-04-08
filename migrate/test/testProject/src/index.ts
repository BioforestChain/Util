export function ClassStaticImplement<T>() {
  return <U extends T>(constructor: U) => constructor;
}
