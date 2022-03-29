import { CustomError } from "@bfchain/util-extends-error";
/**
 * Why AbortError
 * 为了和其它的Error进行区分
 * 一般的Error是来自代码的异常、数据服务的异常
 * 但是AbortError是来自用户的操作，主动取消某个执行中的动作
 * 一般来说如果是AbortError，我们可以跳过不处理，至少不需要将这种异常展示给用户
 *
 * @export
 * @class AbortError
 * @extends {Error}
 */
export class PromiseAbortError extends CustomError {
  ABORT_ERROR_FLAG = true;
  constructor(message?: string, public silence?: boolean) {
    super(message);
  }
}
