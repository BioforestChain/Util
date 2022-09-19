/**
 * 从堆栈中一个函数的获取调用者的信息
 * @param caller 如果支持`Error.captureStackTrace`，则使用caller定位
 * @param deep 否则直接使用手动计数定位
 */
export const captureErrorStackTrace = Error.captureStackTrace
  ? (target: Object, caller: Function) => {
      Error.captureStackTrace(target, caller);
      return target;
    }
  : (target: Object | { stack?: string }, caller: Function) => {
      let deep = 0;
      let ErrorCtor = caller;
      do {
        try {
          if (ErrorCtor && ErrorCtor !== Error) {
            deep += 1;
            ErrorCtor = Object.getPrototypeOf(ErrorCtor.prototype).constructor;
          } else {
            break;
          }
        } catch (err) {
          break;
        }
      } while (true);
      const stack = ("stack" in target && target.stack) || "";
      Object.defineProperty(target, "stack", {
        value: (stack.split("\n")[deep + 1] || "").trim(),
        enumerable: true,
        configurable: true,
      });
      return target;
    };

export const GetCallerInfo: (caller: Function) => string = Error.captureStackTrace
  ? (caller: Function) => {
      const stackInfo = { stack: "" };
      Error.captureStackTrace(stackInfo, caller);
      return stackInfo.stack;
    }
  : /**使用Function动态生成来规避严格模式的代码解析 */
    (Function(
      "f",
      `
    let deep = 0;
    let caller = arguments.callee;
    do {
      if (caller.caller === f) {
        break;
      }
      deep += 1;
      caller = caller.caller;
      if (caller === null) {
        break;
      }
    } while (true);
    const stack = new Error().stack || "";
    const stackLineLine = stack.split('\\n');
    stackLineLine.splice(1, deep);
    return stackLineLine.join('\\n');
  `,
    ) as any);

export class CustomError extends Error {
  get name() {
    return this.constructor.name;
  }
  static call(_this: any, message?: string) {
    if (!(_this instanceof CustomError)) {
      throw new TypeError("please use new keyword to create CustomError instance.");
    }
    _this.stack = GetCallerInfo(_this.constructor);
    _this.message = message || "";
    return _this;
  }
}
