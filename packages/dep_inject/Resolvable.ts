import { $ResolvableOptions } from "./$types.ts";

/**
 * 标记为不可注入的模块，但因为有修饰器的存在，所以构造函数的情况会被完整地提供
 *
 * @TODO 应该提供一些功能，可以让moduleMap判断出指定对象是自己Resolve出来的
 */
export function Resolvable(opts?: $ResolvableOptions) {
  return (Ctor: any) => {};
}
