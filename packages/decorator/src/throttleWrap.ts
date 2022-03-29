import { ignoreAwait } from "@bfchain/util-typings";

/**队列策略 */
export enum THROTTLE_WRAP_PLOT {
  /**等待任务执行完成才开始下一个任务 */
  WAIT_RESULT_RETURN,
  /**不等待任务执行完成，只要一开始执行，就能开始执行下一个任务 */
  NO_WAIT_EXEC_TIME,
}
/**
 *
 * @param ms
 */
export function throttleWrap(ms: number = 1000, plot = THROTTLE_WRAP_PLOT.WAIT_RESULT_RETURN) {
  return (target: any, name: any, descriptor: PropertyDescriptor) => {
    const source_fun = descriptor.value;
    let run_lock: Promise<any> | undefined;
    descriptor.value = async function lock(...args: any[]) {
      if (run_lock) {
        run_lock = new Promise((resolve, reject) => {
          setTimeout(() => {
            const res: Promise<any> = source_fun.apply(this, args);
            if (plot === THROTTLE_WRAP_PLOT.WAIT_RESULT_RETURN) {
              ignoreAwait(res.then(resolve, reject).finally(() => {
                run_lock = undefined;
              }));
            } else if (plot === THROTTLE_WRAP_PLOT.NO_WAIT_EXEC_TIME) {
              resolve(res);
              run_lock = undefined;
            } else {
              throw new SyntaxError(
                `No support throttleWrap plot:${THROTTLE_WRAP_PLOT.NO_WAIT_EXEC_TIME}`,
              );
            }
          }, ms);
        });
      }
      return run_lock;
    };
    descriptor.value.source_fun = source_fun;
    return descriptor;
  };
}
