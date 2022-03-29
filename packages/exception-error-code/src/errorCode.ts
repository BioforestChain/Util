/**
 * # 错误码
 *
 * 共8位，前三位为大类，后五位为具体错误。
 *
 * 后五位中在引用的地方自定义分类
 *
 * ## 大类分类
 *
 * - 001: 来自core包的共识错误
 * - 002: 来自pc节点包的错误
 * - 003: 来自browser的错误
 * - 004: 来自app的错误
 *
 * 后续自行补充。。。
 *
 */
export class ErrorCode<T extends string = string, U extends string = string> {
  private __code: string;
  private __message: string;

  constructor(code: T, message: U) {
    this.__code = code;
    this.__message = message;
  }

  get code() {
    return this.__code;
  }

  get message() {
    return this.__message;
  }

  set message(newMessage: string) {
    this.__message = newMessage;
  }

  build(args?: { [key: string]: string | number }) {
    return args
      ? this.__message.replace(/\{([^\\]+?)\}/g, (match, key: string) => {
          return (args[key] as string) ?? match;
        })
      : this.__message;
  }
}
