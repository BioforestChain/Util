import { PromiseOut } from "@bfchain/util-extends-promise-out";
import { safePromiseRace } from "@bfchain/util-extends-promise-safe";
type ParallelExector<T> = () => BFChainUtil.PromiseMaybe<T>;

type ParallelSuccess<T> = { asset: T };
type ParallelError<T> = { error: unknown };
type ParallelYield<T> = ParallelSuccess<T> | ParallelError<T>;
type ParallelSuccessRunningReturn<T> = ParallelSuccess<T> & { rm: () => void };
type ParallelLine<T> = AsyncGenerator<ParallelYield<T>>;
type YieldParallelOptions = {
  ignoreError?: boolean; // 默认会抛出错误
  onError?: (err: unknown) => unknown;
};
/**
 * 并发池
 */
export class ParallelPool<T = any> {
  constructor(public maxParallelNum = 2) {}
  /**正在执行中的任务集合 */
  private _runningTasks: Promise<ParallelSuccessRunningReturn<T> | undefined>[] = [];

  /**等待执行队列 */
  private _waitingQuene: {
    executor: ParallelExector<T>;
    po: PromiseOut<T>;
  }[] = [];

  addTaskExecutor(executor: ParallelExector<T>) {
    const po = new PromiseOut<T>();
    this._waitingQuene.push({ executor, po });
    return po.promise;
  }
  /**
   * 知否执行完毕
   */
  get isDone() {
    return this._runningTasks.length === 0 && this._waitingQuene.length === 0;
  }
  /**
   * 是否还有任务
   * 和isDone是反义关系
   */
  get hasTask() {
    return !this.isDone;
  }
  /**
   * 现在队列是否是满的
   * 可以用来判断是否还应该添加任务
   */
  get isFull() {
    return this._runningTasks.length + this._waitingQuene.length >= this.maxParallelNum;
  }

  /**执行一条并发线 */
  private async *_startParallel(): ParallelLine<T> {
    do {
      const item = this._waitingQuene.shift();
      if (!item) {
        break;
      }
      try {
        // this._runningTasks.add(item.po.promise);
        const result = await item.executor();
        item.po.resolve(result);
        yield { asset: result };
      } catch (err) {
        yield { error: err };
        item.po.reject(err);
      } /*  finally {
        this._runningTasks.delete(item.po.promise);
      } */
    } while (true);
  }

  /**
   * Like `Promise.all`
   * @param opts
   */
  async doAll(opts?: YieldParallelOptions) {
    const list = [] as T[];
    for await (const res of this.yieldResults(opts)) {
      list.push(res);
    }
    return list;
  }
  /**
   * Like `Promise.race`
   * @param opts
   */
  async doRace(opts?: YieldParallelOptions) {
    for await (const res of this.yieldResults(opts)) {
      return res;
    }
  }

  private _yielding?: AsyncGenerator<T>;

  /**
   * ## 使用异步迭代器持续地输出并发执行的任务.
   * **虽然这是一个单个出口的函数，当内部会尽量保持声明的并发数来进行任务执行。**
   *
   * ### 比如说：
   * 1. 我并发5条任务线，这时候`yield`到外部了，等待外部响应。
   * 2. 这时候并发器内部在执行着任务，外部没有去给它响应，但它仍旧执行着，直到`5`个并发的任务执行完了。
   * 3. 这时候它会暂停下来。这是维持了一个异步迭代器的初衷：**我停止迭代了，也就不再消耗资源了**。
   * 4. 但如果这个时候继续迭代下去，比如只迭代了`1`次，那么就会有`1`个并发线继续启动。
   * 5. 不会因为一次迭代而再次启用5个任务线。
   *
   * **也就是说，缓冲区的大小和并发数是对等的。**
   *
   * ### 综上所述，我们还可以衍生出这样操作：
   * 1. 在上述例子中，在`3.`之后，我们将`maxParallelNum`设置为`0`
   * 2. 而后我们再去执行`4.`。这时候就不会再有并发线再被启动
   *
   * ### 注意事项
   * 1. 从这里开始，后续添加任务也会被自动执行，直到任务都执行完毕后会自动完结。
   * 2. 所以如果在完结后再添加任务的话，需要手动再进行重启迭代
   * 3. 有且只能有一个迭代器在执行
   */
  yieldResults(opts?: YieldParallelOptions) {
    if (!this._yielding) {
      this._yielding = this._yieldResults(opts);
    }
    return this._yielding;
  }

  private async *_yieldResults(opts: YieldParallelOptions = {}) {
    /**空闲并发线 */
    const freeParallelList: ParallelLine<T>[] = [];
    const getFreeParallelList = () => {
      const parallel = this._startParallel();
      return parallel;
    };

    /**正在执行中的任务队列 */
    const parallelTaskList = this._runningTasks;
    do {
      /**
       * 根据并发数来对任务队列进行填充，并且等待执行队列里头有要有任务
       * 这时候添加一个并发线，并令其领走一个任务去执行
       */
      while (parallelTaskList.length < this.maxParallelNum && this._waitingQuene.length > 0) {
        /**
         * 获取一个空闲的并发线
         */
        const freeParallel = freeParallelList.shift() || getFreeParallelList();
        /**
         * 命令它开始执行任务
         */
        const task = freeParallel.next().then((ires) => {
          /// 尝试处理结果并进行返回
          if (!ires.done) {
            // 如果还能继续执行，就将并发线回归到空闲队列中
            freeParallelList.push(freeParallel);
            /// 解析结果并返回
            const result = ires.value;
            if (result) {
              if ("error" in result) {
                if (opts.onError) {
                  opts.onError(result.error);
                }
                if (!opts.ignoreError) {
                  throw result.error;
                }
              } else {
                return {
                  asset: result.asset,
                  /**
                   * 这里我们不直接做移除，而是在等yield的返回之后才能进行移除
                   * 因为如果直接移除的话，freeParallelList在下一次yield之前就会已经清空了
                   * 我们需要控制每一个yield只能启动一个任务
                   */
                  rm: removeFromParallelTaskList,
                };
              }
            }
          }

          /// 如果是done，或者是error但不中断，自动从队列中移除这条任务
          removeFromParallelTaskList();
        });
        // 添加到队列中
        parallelTaskList.push(task);
        /**
         * 从队列中移除的实现
         */
        const removeFromParallelTaskList = () => {
          const index = parallelTaskList.indexOf(task);
          if (index !== -1) {
            parallelTaskList.splice(index, 1);
          }
        };
      }
      /// 如果在填充之后任务仍旧是空，那么就中断迭代
      if (parallelTaskList.length === 0) {
        break;
      }
      /// 等任务被填满，就可以进行返回
      const result = await safePromiseRace(parallelTaskList);
      if (result) {
        yield result.asset;
        result.rm();
      }
    } while (true);
    /// 解除锁定
    this._yielding = undefined;
  }
}

// if (module === process.mainModule) {
//   (async function test() {
//     const pp = new ParallelPool<number>(5);
//     for (let i = 0; i < 100; i += 1) {
//       pp.addTaskExecutor(() => {
//         console.log(i);
//         return i * i;
//       });
//     }
//     let step = 0;
//     for await (const v of pp.yieldResults()) {
//       if (step >= 5) {
//         pp.maxParallelNum = 0;
//       }
//       console.log("STEP:", ++step, "VALUE:", v);
//     }
//   })();
// }
