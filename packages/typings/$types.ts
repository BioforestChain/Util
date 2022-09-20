/**函数的第一个参数类型 */
export type $FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
  ? U
  : any;
/**函数的第二个参数类型 */
export type $SecondArgument<T> = T extends (
  arg1: any,
  arg2: infer U,
  ...args: any[]
) => any
  ? U
  : any;
/**函数的第三个参数类型 */
export type $ThirdArgument<T> = T extends (
  arg1: any,
  arg2: any,
  arg3: infer U,
  ...args: any[]
) => any
  ? U
  : any;

/**函数的所有参数类型 */
export type $AllArgument<T> = T extends (...args: infer U) => any ? U : any;
export type $GeneratorYieldType<G extends Generator> = G extends Generator<
  infer Y
>
  ? Y
  : never;
export type $GeneratorReturnType<G extends Generator> = G extends Generator<
  any,
  infer Y
>
  ? Y
  : never;

/**获取获取Promise内部的类型 */
export type $PromiseType<T> = Awaited<T>;
export type $PromiseOne<T> = PromiseLike<Awaited<T>>;
/**获取获取异步函数返回类型的内部类型 */
export type $PromiseReturnType<T> = T extends (...args: any) => infer P
  ? P extends PromiseLike<infer R>
    ? R
    : P
  : never;

export type $PromiseMaybe<T> = T | PromiseLike<T>;

/**使用 S 里同样属性的值去填充 T 的所有属性 */
export type $FillKeys<T, S extends { [key in any]: any }> = {
  [P in keyof T]: S[P];
};
/**往一个数组前面面插入一个元素 */
export type $ArrayUnshift<T extends any[], A> = ((
  a: A,
  ...b: T
) => void) extends (...a: infer R) => void
  ? R
  : never;
export type $ArrayShift<T extends any[]> = ((...a: T) => void) extends (
  a: any,
  ...b: infer R
) => void
  ? R
  : never;

/**往一个数组后面追加一个元素 */
export type $ArrayPush<T extends any[], A> = $FillKeys<
  $ArrayUnshift<T, any>,
  Record<string, A> & T
> extends infer ARR
  ? ARR extends any[]
    ? ARR
    : never
  : never;
export type $ArrayPop<T extends any[]> = $FillKeys<
  $ArrayShift<T>,
  T
> extends infer ARR
  ? ARR extends any[]
    ? ARR
    : never
  : never;

/**构造函数 */
export interface $Constructor<T> {
  new (...args: any[]): T;
  // prototype: T;
}
export interface $JSONAble<T = unknown> {
  toJSON(): T;
}
export type $ToJSONType<T> = T extends $JSONAble<infer U> ? U : T;

export type $EmptyObject = Record<never, never>;

export namespace $NodeJS {
  export type Process = {
    env: { [key: string]: string };
    stderr: { isTTY: boolean };
    platform: string;
    version: string;
    versions: {
      v8: string;
      node: string;
    };
  };
}
