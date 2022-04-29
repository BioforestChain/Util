declare namespace BFChainUtil {
  //#region Exception
  interface ExceptionCollection
    extends ReturnType<
      typeof import("./ExceptionGenerator").ExceptionGenerator
    > {}
  //#endregion

  type EXCEPTION_SEVERIFY = import("./ExceptionGenerator").EXCEPTION_SEVERIFY;

  interface ExceptionConstructor<E extends Exception = Exception> {
    new (
      message?: string | BFChainUtil.ErrorCode,
      detail?: any,
      CODE?: string,
      SEVERIFY?: EXCEPTION_SEVERIFY
    ): E;
    is(err?: unknown): err is E;
    prototype: E;
    TYPE: string;
    PLATFORM: string;
    CHANNEL: string;
    BUSINESS: string;
    MODULE: string;
    FILE: string;
    CODE: string;
    SEVERIFY?: EXCEPTION_SEVERIFY;
    ERROR_CODE_MAP: Map<string, string>;
  }
  class Exception extends Error {
    type: string;
    PLATFORM: string;
    CHANNEL: string;
    BUSINESS: string;
    MODULE: string;
    FILE: string;
    CODE: string;
    detail?: unknown;
    SEVERIFY: EXCEPTION_SEVERIFY;
  }

  class OutOfRangeException extends Exception {}
  class ArgumentException extends Exception {}
  class ArgumentIllegalException extends Exception {}
  class ArgumentFormatException extends Exception {}
  class NoFoundException extends Exception {}
  class ResponseException extends Exception {}
  class IOException extends Exception {}
  class NetworkIOException extends Exception {}
  class BusyIOException extends Exception {}
  class DatebaseIOException extends Exception {}
  class InterruptedException extends Exception {}
  class IllegalStateException extends Exception {}
  class TimeOutException extends Exception {}
  class BusyException extends Exception {}
  class ConsensusException extends Exception {}
  class AbortException extends Exception {}
  class RefuseException extends Exception {}
}
