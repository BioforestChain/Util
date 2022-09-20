import { $ignoreAwait, $PromiseType } from "../typings/index.ts";
class SimplePromiseOut<R> {
  resolve!: (value: R) => void;
  reject!: (reason?: unknown) => void;
  readonly promise = new Promise<R>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}
const simpleSleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 纯函数版的 quene
 * @param sourceFun
 * @param opts
 */
export function FunctionQuener<
  ARGS extends unknown[] = any[],
  RES = any,
  PR extends $PromiseType<RES> = $PromiseType<RES>
>(
  sourceFun: (...args: ARGS) => RES,
  opts: {
    bounceTime?: number;
    argsMerger?: (newArgs: ARGS, oldArgs: ARGS) => ARGS;
  } = {}
) {
  const { bounceTime, argsMerger } = opts;
  /**当前正在执行的任务 */
  let _taskLock: SimplePromiseOut<PR> | undefined;
  /**队列中的任务 */
  let _inQueneTask:
    | {
        lock: SimplePromiseOut<PR>;
        args: ARGS;
      }
    | undefined;

  async function loopDoTask(_this: unknown, args: ARGS) {
    do {
      const lock = _taskLock;
      if (!lock) {
        return;
      }
      try {
        const startTime = Date.now();
        lock.resolve((await sourceFun.apply(_this, args)) as unknown as PR);
        if (bounceTime) {
          const restTime = bounceTime - (Date.now() - startTime);
          if (restTime > 1) {
            await simpleSleep(restTime);
          }
        }
      } catch (err) {
        lock.reject(err);
      } finally {
        _taskLock = undefined;

        /// 如果当前有排队的任务在等待执行，那么执行这个队列
        if (_inQueneTask) {
          _taskLock = _inQueneTask.lock;
          args = _inQueneTask.args;
          _inQueneTask = undefined;
        }
      }
    } while (true);
  }

  function functionQuened(this: unknown, ...args: ARGS) {
    /// 如果当前有任务在执行，添加一个合并的任务队列
    if (_taskLock) {
      /// 放置一个队列
      if (!_inQueneTask) {
        _inQueneTask = { lock: new SimplePromiseOut<PR>(), args };
      } else {
        _inQueneTask.args = argsMerger
          ? argsMerger(args, _inQueneTask.args)
          : args;
      }
      return _inQueneTask.lock.promise;
    }
    // 自行加锁
    _taskLock = new SimplePromiseOut<PR>();
    /// 开始循环执行任务
    $ignoreAwait(loopDoTask(this, args));
    return _taskLock.promise;
  }
  Object.defineProperty(functionQuened, "source_fun", {
    value: sourceFun,
    writable: false,
    configurable: false,
    enumerable: false,
  });
  return functionQuened;
}

type Parameters<T> = T extends (...args: infer P) => any ? P : any[];
/**
 * 用做修饰器版的 quene
 * @param opts
 */
export function quene<
  T extends { [key: string]: any } = any,
  P extends string = any,
  ARSG extends Parameters<T[P]> = Parameters<T[P]>
>(
  opts: {
    bounceTime?: number;
    argsMerger?: (newArgs: ARSG, oldArgs: ARSG) => ARSG;
  } = {}
) {
  return function queneInner(
    target: T,
    propertyKey: P,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    if (!descriptor || typeof descriptor.value !== "function") {
      throw new TypeError(
        `Only methods can be decorated with @quene. <${propertyKey}> is not a method!`
      );
    }

    const res = {
      configurable: true,
      value: FunctionQuener<ARSG>(descriptor.value, opts),
      enumerable: descriptor.enumerable,
    };
    return res;
  };
}

// class B {
//   @quene<B, "say">({
//     argsMerger(newArgs, oldArgs) {
//       return [oldArgs[0] + " " + newArgs[0]];
//     },
//   })
//   async say(word: string) {
//     await new Promise((resolve) => setTimeout(resolve, 100));
//     console.log(word);
//   }
// }

// const b = new B();
// b.say("I");
// b.say("love");
// b.say("you!");

// const a = FunctionQuener(() => {
//   return Promise.resolve(1);
// });
