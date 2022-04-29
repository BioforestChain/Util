import { CustomError } from "@bfchain/util-extends-error";
import { ErrorCode } from "@bfchain/util-exception-error-code";
import { cacheObjectGetter } from "@bfchain/util-extends-object";

//#region 定义异常
/**错误码集合 */
export const CustomErrorCodeMap = new Map<string, string>();

/**错误严重程度 */
export const enum EXCEPTION_SEVERIFY {
  /**崩溃 */
  BLOCKER = "blocker",
  /**严重 */
  CRITICAL = "critical",
  /**一般 */
  MAJOR = "major",
  /**次要 */
  MINOR = "minor",
}

export class Exception extends CustomError {
  static TYPE = "Exception";
  static PLATFORM = "";
  static CHANNEL = "";
  static BUSINESS = "";
  static MODULE = "";
  static FILE = "";
  static CODE = "";
  static SEVERIFY = EXCEPTION_SEVERIFY.MAJOR;
  static ERROR_CODE_MAP: Map<string, string> = CustomErrorCodeMap;

  public readonly sourceMessage!: string;
  public readonly type!: string;
  public readonly PLATFORM!: string;
  public readonly CHANNEL!: string;
  public readonly BUSINESS!: string;
  public readonly MODULE!: string;
  public readonly FILE!: string;
  public readonly CODE!: string;
  public readonly SEVERIFY!: EXCEPTION_SEVERIFY;
  get name() {
    const ctor = this.constructor as typeof Exception;
    return ctor.TYPE;
  }

  constructor(
    sourceMessage: string | ErrorCode<string, string> = "",
    public detail?: any,
    CODE?: string,
    SEVERIFY?: EXCEPTION_SEVERIFY
  ) {
    // super(
    //   detail
    //     ? sourceMessage.replace(/\{([^\\]+?)\}/g, (match, key) => {
    //         return detail[key] ?? match;
    //       })
    //     : sourceMessage,
    // );
    super(
      detail
        ? sourceMessage instanceof ErrorCode
          ? sourceMessage.build(detail)
          : sourceMessage.replace(/\{([^\\]+?)\}/g, (match, key) => {
              return detail[key] ?? match;
            })
        : sourceMessage instanceof ErrorCode
        ? sourceMessage.message
        : sourceMessage
    );
    const ExceptionCtor = this.constructor as BFChainUtil.ExceptionConstructor;
    const { ERROR_CODE_MAP } = ExceptionCtor;

    Object.defineProperties(this, {
      detail: { value: detail, enumerable: false, writable: false },
      sourceMessage: {
        value: sourceMessage,
        enumerable: false,
        writable: false,
      },
      type: { value: ExceptionCtor.TYPE, enumerable: false, writable: false },
      PLATFORM: {
        value: ExceptionCtor.PLATFORM,
        enumerable: false,
        writable: false,
      },
      CHANNEL: {
        value: ExceptionCtor.CHANNEL,
        enumerable: false,
        writable: false,
      },
      BUSINESS: {
        value: ExceptionCtor.BUSINESS,
        enumerable: false,
        writable: false,
      },
      MODULE: {
        value: ExceptionCtor.MODULE,
        enumerable: false,
        writable: false,
      },
      FILE: { value: ExceptionCtor.FILE, enumerable: false, writable: false },
      // CODE: {
      //   value:
      //     CODE ?? (ERROR_CODE_MAP.get(sourceMessage) || ERROR_CODE_MAP.get("unknown error") || ""),
      //   enumerable: false,
      //   writable: false,
      // },
      CODE: {
        value:
          CODE ??
          (sourceMessage instanceof ErrorCode
            ? sourceMessage.code
            : ERROR_CODE_MAP.get(sourceMessage) ||
              ERROR_CODE_MAP.get("unknown error") ||
              ""),
        enumerable: false,
        writable: false,
      },
      SEVERIFY: {
        value: SEVERIFY || EXCEPTION_SEVERIFY.MAJOR,
        enumerable: false,
        writable: false,
      },
    });
  }
  static is<E extends BFChainUtil.Exception>(
    this: BFChainUtil.ExceptionConstructor<E>,
    err: any
  ): err is E {
    return !!(err && err.type === this.TYPE);
  }
}

//#endregion

if (typeof Error.stackTraceLimit === "number") {
  Error.stackTraceLimit += 3;
}
//#region 异常打包

/**
 *
 * @param PLATFORM 平台
 * @param CHANNEL 渠道
 * @param BUSINESS 业务
 * @param MODULE 模块
 * @param FILE 文件
 */
export function ExceptionGenerator(
  PLATFORM: string,
  CHANNEL: string,
  BUSINESS: string,
  MODULE: string,
  FILE: string,
  ERROR_CODE_MAP: Map<string, string>
) {
  function getException<E extends BFChainUtil.ExceptionConstructor>(Con: E) {
    Con.PLATFORM = PLATFORM;
    Con.CHANNEL = CHANNEL;
    Con.BUSINESS = BUSINESS;
    Con.MODULE = MODULE;
    Con.FILE = FILE;
    Con.ERROR_CODE_MAP = ERROR_CODE_MAP;
    Object.freeze(Con);

    return Con;
  }

  const exceptionHashMap = {
    getException,
    get Exception() {
      const E = Exception;
      {
        return getException<
          BFChainUtil.ExceptionConstructor<BFChainUtil.Exception>
        >(class Exception extends E {});
      }
    },

    /**范围溢出错误 */
    get OutOfRangeException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.OutOfRangeException>
      >(
        class OutOfRangeException extends Exception {
          static TYPE = "OutOfRangeException";
        }
      );
    },
    /**非法参数 */
    get ArgumentException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.ArgumentException>
      >(
        class ArgumentException extends Exception {
          static TYPE = "ArgumentException";
        }
      );
    },
    /**非法参数：参数类型、结构错误 */
    get ArgumentIllegalException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.ArgumentIllegalException>
      >(
        class ArgumentIllegalException extends Exception /* ArgumentException */ {
          static TYPE = "ArgumentIllegalException";
        }
      );
    },
    /**非法参数：不符合预期的定义，比如要>0，比如只能是"A"与"B" */
    get ArgumentFormatException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.ArgumentFormatException>
      >(
        class ArgumentFormatException extends Exception /* ArgumentException */ {
          static TYPE = "ArgumentFormatException";
        }
      );
    },
    /**找不到该有的 */
    get NoFoundException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.NoFoundException>
      >(
        class NoFoundException extends Exception {
          static TYPE = "NoFoundException";
        }
      );
    },
    /**没有可用响应的异常 */
    get ResponseException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.ResponseException>
      >(
        class ResponseException extends Exception {
          static TYPE = "ResponseException";
        }
      );
    },

    /**IO错误 */
    get IOException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.IOException>
      >(
        class IOException extends Exception {
          static TYPE = "IOException";
        }
      );
    },
    /**网络IO错误 */
    get NetworkIOException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.NetworkIOException>
      >(
        class NetworkIOException extends Exception /* IOException */ {
          static TYPE = "NetworkIOException";
        }
      );
    },
    /**繁忙IO错误 */
    get BusyIOException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.BusyIOException>
      >(
        class BusyIOException extends Exception /* IOException */ {
          static TYPE = "BusyIOException";
        }
      );
    },
    /**数据库IO错误 */
    get DatebaseIOException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.DatebaseIOException>
      >(
        class DatebaseIOException extends Exception /* IOException */ {
          static TYPE = "DatebaseIOException";
        }
      );
    },

    /**中断异常
     * 流程异常中断时应该打印或者抛出这个错误，而后执行接下来的处理逻辑
     */
    get InterruptedException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.InterruptedException>
      >(
        class InterruptedException extends Exception {
          static TYPE = "InterruptedException";
        }
      );
    },
    /**
     * 非法状态、流程错误
     * 再执行某些任务时有一些前置工作还没准备好时提供这个错误
     */
    get IllegalStateException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.IllegalStateException>
      >(
        class IllegalStateException extends Exception {
          static TYPE = "IllegalStateException";
        }
      );
    },
    get TimeOutException() {
      /**响应超时的异常 */
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.TimeOutException>
      >(
        class TimeOutException extends Exception {
          static TYPE = "TimeOutException";
        }
      );
    } /**繁忙的异常 */,
    get BusyException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.BusyException>
      >(
        class BusyException extends Exception {
          static TYPE = "BusyException";
        }
      );
    },
    /**共识异常 */
    get ConsensusException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.ConsensusException>
      >(
        class ConsensusException extends Exception {
          static TYPE = "ConsensusException";
        }
      );
    },
    /**中断 */
    get AbortException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.AbortException>
      >(
        class AbortException extends Exception {
          static TYPE = "AbortException";
        }
      );
    },
    /**响应拒绝异常 */
    get RefuseException() {
      return getException<
        BFChainUtil.ExceptionConstructor<BFChainUtil.RefuseException>
      >(
        class RefuseException extends Exception {
          static TYPE = "RefuseException";
        }
      );
    },
  };

  return cacheObjectGetter(exceptionHashMap);
}
