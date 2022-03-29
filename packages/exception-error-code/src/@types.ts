declare namespace BFChainUtil {
  type ErrorCode<
    T extends string = string,
    U extends string = string,
  > = import("./errorCode").ErrorCode<T, U>;
}
