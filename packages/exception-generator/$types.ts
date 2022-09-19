import { $ErrorCode } from "../exception-error-code/$types.ts";
import {
  ExceptionGenerator,
  EXCEPTION_SEVERIFY,
} from "./ExceptionGenerator.ts";
//#region Exception
export interface $ExceptionCollection
  extends ReturnType<typeof ExceptionGenerator> {}
//#endregion

export type $EXCEPTION_SEVERIFY = typeof EXCEPTION_SEVERIFY;

export interface $ExceptionConstructor<E extends $Exception = $Exception> {
  new (
    message?: string | $ErrorCode,
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
export declare class $Exception extends Error {
  type: string;
  PLATFORM: string;
  CHANNEL: string;
  BUSINESS: string;
  MODULE: string;
  FILE: string;
  CODE: string;
  detail?: unknown;
  SEVERIFY: unknown; // 使用枚举类型编译报错
}

export declare class $OutOfRangeException extends $Exception {}
export declare class $ArgumentException extends $Exception {}
export declare class $ArgumentIllegalException extends $Exception {}
export declare class $ArgumentFormatException extends $Exception {}
export declare class $NoFoundException extends $Exception {}
export declare class $ResponseException extends $Exception {}
export declare class $IOException extends $Exception {}
export declare class $NetworkIOException extends $Exception {}
export declare class $BusyIOException extends $Exception {}
export declare class $DatebaseIOException extends $Exception {}
export declare class $InterruptedException extends $Exception {}
export declare class $IllegalStateException extends $Exception {}
export declare class $TimeOutException extends $Exception {}
export declare class $BusyException extends $Exception {}
export declare class $ConsensusException extends $Exception {}
export declare class $AbortException extends $Exception {}
export declare class $RefuseException extends $Exception {}
