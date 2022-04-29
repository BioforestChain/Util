// declare const ENV: "production" | "development" /* | "prod" | "dev" */ | undefined | never;
declare namespace BFChainUtil {
  //#region type interface
  /**函数的第一个参数类型 */
  type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
    ? U
    : any;
  /**函数的第二个参数类型 */
  type SecondArgument<T> = T extends (
    arg1: any,
    arg2: infer U,
    ...args: any[]
  ) => any
    ? U
    : any;
  /**函数的第三个参数类型 */
  type ThirdArgument<T> = T extends (
    arg1: any,
    arg2: any,
    arg3: infer U,
    ...args: any[]
  ) => any
    ? U
    : any;

  /**函数的所有参数类型 */
  type AllArgument<T> = T extends (...args: infer U) => any ? U : any;
  type GeneratorYieldType<G extends Generator> = G extends Generator<infer Y>
    ? Y
    : never;
  type GeneratorReturnType<G extends Generator> = G extends Generator<
    any,
    infer Y
  >
    ? Y
    : never;

  /**获取获取Promise内部的类型 */
  type PromiseType<T> = T extends PromiseLike<infer R> ? R : T;
  type PromiseOne<T> = PromiseLike<PromiseType<T>>;
  /**获取获取异步函数返回类型的内部类型 */
  type PromiseReturnType<T> = T extends (...args: any) => infer P
    ? P extends PromiseLike<infer R>
      ? R
      : P
    : never;

  type PromiseMaybe<T> = T | PromiseLike<T>;

  /**使用 S 里同样属性的值去填充 T 的所有属性 */
  type FillKeys<T, S extends { [key in any]: any }> = { [P in keyof T]: S[P] };
  /**往一个数组前面面插入一个元素 */
  type ArrayUnshift<T extends any[], A> = ((a: A, ...b: T) => void) extends (
    ...a: infer R
  ) => void
    ? R
    : never;
  type ArrayShift<T extends any[]> = ((...a: T) => void) extends (
    a: any,
    ...b: infer R
  ) => void
    ? R
    : never;

  /**往一个数组后面追加一个元素 */
  type ArrayPush<T extends any[], A> = FillKeys<
    ArrayUnshift<T, any>,
    Record<string, A> & T
  > extends infer ARR
    ? ARR extends any[]
      ? ARR
      : never
    : never;
  type ArrayPop<T extends any[]> = FillKeys<ArrayShift<T>, T> extends infer ARR
    ? ARR extends any[]
      ? ARR
      : never
    : never;

  /**构造函数 */
  interface Constructor<T> {
    new (...args: any[]): T;
    // prototype: T;
  }
  interface JSONAble<T = unknown> {
    toJSON(): T;
  }
  type ToJSONType<T> = T extends JSONAble<infer U> ? U : T;

  //#endregion
}
