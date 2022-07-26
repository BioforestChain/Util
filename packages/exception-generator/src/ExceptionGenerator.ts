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

export abstract class Exception
  extends CustomError
  implements BFChainUtil.Exception
{
  static TYPE = "Exception";
  static readonly PLATFORM = "";
  static readonly CHANNEL = "";
  static readonly BUSINESS = "";
  static readonly MODULE = "";
  static readonly FILE = "";
  static readonly CODE = "";
  static readonly SEVERIFY = EXCEPTION_SEVERIFY.MAJOR;
  static readonly ERROR_CODE_MAP: Map<string, string> = CustomErrorCodeMap;

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
    if (ABS_EXCPTION_CTORS.has(this.constructor)) {
      throw new Error(
        "please use ExceptionGenerator to get Exception Constructor"
      );
    }

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

export abstract class OutOfRangeException extends Exception {
  static TYPE = "OutOfRangeException";
}
export abstract class ArgumentException extends Exception {
  static TYPE = "ArgumentException";
}
export abstract class ArgumentIllegalException extends Exception {
  static TYPE = "ArgumentIllegalException";
}
export abstract class ArgumentFormatException extends Exception {
  static TYPE = "ArgumentFormatException";
}
export abstract class NoFoundException extends Exception {
  static TYPE = "NoFoundException";
}
export abstract class ResponseException extends Exception {
  static TYPE = "ResponseException";
}
export abstract class IOException extends Exception {
  static TYPE = "IOException";
}
export abstract class NetworkIOException extends Exception {
  static TYPE = "NetworkIOException";
}
export abstract class BusyIOException extends Exception {
  static TYPE = "BusyIOException";
}
export abstract class DatebaseIOException extends Exception {
  static TYPE = "DatebaseIOException";
}
export abstract class InterruptedException extends Exception {
  static TYPE = "InterruptedException";
}
export abstract class IllegalStateException extends Exception {
  static TYPE = "IllegalStateException";
}
export abstract class TimeOutException extends Exception {
  static TYPE = "TimeOutException";
}
export abstract class BusyException extends Exception {
  static TYPE = "BusyException";
}
export abstract class ConsensusException extends Exception {
  static TYPE = "ConsensusException";
}
export abstract class AbortException extends Exception {
  static TYPE = "AbortException";
}
export abstract class RefuseException extends Exception {
  static TYPE = "RefuseException";
}

const ABS_EXCPTION_CTORS = new Set<Function>([
  Exception,
  OutOfRangeException,
  ArgumentException,
  ArgumentIllegalException,
  ArgumentFormatException,
  NoFoundException,
  ResponseException,
  IOException,
  NetworkIOException,
  BusyIOException,
  DatebaseIOException,
  InterruptedException,
  IllegalStateException,
  TimeOutException,
  BusyException,
  ConsensusException,
  AbortException,
  RefuseException,
]);

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
  const getException = <
    E extends BFChainUtil.Exception,
    C extends abstract new () => E
  >(
    Con: C
  ) => {
    const ExtCon = Con as unknown as BFChainUtil.ExceptionConstructor<E>;
    ExtCon.PLATFORM = PLATFORM;
    ExtCon.CHANNEL = CHANNEL;
    ExtCon.BUSINESS = BUSINESS;
    ExtCon.MODULE = MODULE;
    ExtCon.FILE = FILE;
    ExtCon.ERROR_CODE_MAP = ERROR_CODE_MAP;
    Object.freeze(ExtCon);

    return ExtCon;
  };
  // const genException = <E extends BFChainUtil.ExceptionConstructor>(AbsCtor: E) => {
  //   return class Exc extends AbsCtor {
  //     constructor(...args: any[]) {
  //       super(...args);
  //     }
  //     static #is_base_class = false;
  //   };
  // };

  const exceptionHashMap = {
    getException,
    get Exception() {
      const EC = Exception;
      return getException(class Exception extends EC {});
    },

    /**范围溢出错误 */
    get OutOfRangeException() {
      const EC = OutOfRangeException;
      return getException(class OutOfRangeException extends EC {});
    },
    /**非法参数 */
    get ArgumentException() {
      const EC = ArgumentException;
      return getException(class ArgumentException extends EC {});
    },
    /**非法参数：参数类型、结构错误 */
    get ArgumentIllegalException() {
      const EC = ArgumentIllegalException;
      return getException(class ArgumentIllegalException extends EC {});
    },
    /**非法参数：不符合预期的定义，比如要>0，比如只能是"A"与"B" */
    get ArgumentFormatException() {
      const EC = ArgumentFormatException;
      return getException(class ArgumentFormatException extends EC {});
    },
    /**找不到该有的 */
    get NoFoundException() {
      const EC = NoFoundException;
      return getException(class NoFoundException extends EC {});
    },
    /**没有可用响应的异常 */
    get ResponseException() {
      const EC = ResponseException;
      return getException(class ResponseException extends EC {});
    },

    /**IO错误 */
    get IOException() {
      const EC = IOException;
      return getException(class IOException extends EC {});
    },
    /**网络IO错误 */
    get NetworkIOException() {
      const EC = NetworkIOException;
      return getException(class NetworkIOException extends EC {});
    },
    /**繁忙IO错误 */
    get BusyIOException() {
      const EC = BusyIOException;
      return getException(class BusyIOException extends EC {});
    },
    /**数据库IO错误 */
    get DatebaseIOException() {
      const EC = DatebaseIOException;
      return getException(class DatebaseIOException extends EC {});
    },

    /**中断异常
     * 流程异常中断时应该打印或者抛出这个错误，而后执行接下来的处理逻辑
     */
    get InterruptedException() {
      const EC = InterruptedException;
      return getException(class InterruptedException extends EC {});
    },
    /**
     * 非法状态、流程错误
     * 再执行某些任务时有一些前置工作还没准备好时提供这个错误
     */
    get IllegalStateException() {
      const EC = IllegalStateException;
      return getException(class IllegalStateException extends EC {});
    },
    /**响应超时的异常 */
    get TimeOutException() {
      const EC = TimeOutException;
      return getException(class TimeOutException extends EC {});
    } /**繁忙的异常 */,
    get BusyException() {
      const EC = BusyException;
      return getException(class BusyException extends EC {});
    },
    /**共识异常 */
    get ConsensusException() {
      const EC = ConsensusException;
      return getException(class ConsensusException extends EC {});
    },
    /**中断 */
    get AbortException() {
      const EC = AbortException;
      return getException(class AbortException extends EC {});
    },
    /**响应拒绝异常 */
    get RefuseException() {
      const EC = RefuseException;
      return getException(class RefuseException extends EC {});
    },
  };

  return cacheObjectGetter(exceptionHashMap);
}
