import { ErrorCode } from "./errorCode.ts";
export type $ErrorCode<
  T extends string = string,
  U extends string = string
> = ErrorCode<T, U>;
