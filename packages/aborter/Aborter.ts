import { PromiseOut } from "../extends-promise-out/index.ts";
import { safePromiseRace } from "../extends-promise-safe/index.ts";
import { $PromiseType } from "../typings/$types.ts";
import { $Aborter } from "./$types.ts";

/**中断器 */
export class Aborter<REASON = unknown> implements $Aborter<REASON> {
  private _labels = new Set<$Aborter.Label>();
  hasLabel(label: $Aborter.Label) {
    return this._labels.has(label);
  }
  private wait<R>(task: R, finallycb: Function, label?: $Aborter.Label) {
    const pTask = (
      (task instanceof Promise ? task : Promise.resolve(task)) as Promise<
        $PromiseType<R>
      >
    ).then(
      (res) => {
        finallycb();
        if (label) {
          this._labels.add(label);
        }
        return res;
      },
      (err) => {
        finallycb();
        throw err;
      }
    );
    return pTask;
  }

  private _waitTaskAborterWM = new Map<
    unknown,
    { aborter: PromiseOut<never>; runtimErrorStack: string }
  >();
  wrapAsync<R>(
    task: R,
    label?: $Aborter.Label,
    stackIndex:
      | number
      | { aborter: PromiseOut<never>; runtimErrorStack: string } = 0
  ) {
    const waitTask = this.wait(
      task,
      /// 及时从等待任务队列中移除
      () => {
        this._waitTaskAborterWM.delete(waitTask);
      },
      label
    );
    /// 写入到等待任务队列中
    if (typeof stackIndex === "number") {
      const stackStartLine = stackIndex;
      const aborter = new PromiseOut<never>();
      stackIndex = {
        aborter,
        get runtimErrorStack() {
          return (new Error().stack || "")
            .split("\n")
            .slice(stackStartLine + 3)
            .join("\n");
        },
      };
    }
    this._waitTaskAborterWM.set(waitTask, stackIndex);
    // 等待race返回
    return safePromiseRace([waitTask, stackIndex.aborter.promise]);
  }
  wrapAsyncRunner<ARGS extends any[], R>(
    task: (...args: ARGS) => R,
    label?: symbol
  ) {
    return (...args: ARGS) => this.wrapAsync(task(...args), label, 1);
  }
  async *wrapAsyncIterator<I>(aIterator: AsyncIterator<I>) {
    const aborter = new PromiseOut<never>();
    const stackIndex = {
      aborter,
      get runtimErrorStack() {
        return (new Error().stack || "").split("\n").slice(3).join("\n");
      },
    };
    do {
      const item = await this.wrapAsync(
        aIterator.next(),
        undefined,
        stackIndex
      );
      if (item.done) {
        break;
      }
      yield item.value;
    } while (true);
  }
  async wrapAsyncIteratorReturn<R>(
    aIterator: AsyncIterator<unknown, R, unknown>
  ) {
    do {
      const item = await this.wrapAsync(aIterator.next());
      if (item.done) {
        return item.value;
      }
    } while (true);
  }

  /**
   * 是否已经中断
   */
  get isAborted() {
    return this._isAborted;
  }
  private _isAborted = false;
  /**
   * 中断的原因是什么
   */
  get abortReason() {
    return this._abortReason;
  }
  private _abortReason?: REASON;

  /**
   * 这个promise不会抛出异常
   */
  get afterAborted() {
    return this._afterAborted.promise;
  }

  private _afterAborted_po?: PromiseOut<REASON | undefined>;
  private get _afterAborted() {
    const po =
      this._afterAborted_po || (this._afterAborted_po = new PromiseOut());
    if (this._isAborted) {
      po.resolve(this._abortReason);
    }
    return po;
  }

  /**
   * 这个promise会抛出异常
   */
  get abortedPromise() {
    return this._abortedPromise.promise;
  }
  private _abortedPromise_po?: PromiseOut<never>;
  private get _abortedPromise() {
    const po =
      this._abortedPromise_po || (this._abortedPromise_po = new PromiseOut());
    if (this._isAborted) {
      po.reject(this._abortReason);
    }
    return po;
  }

  /**
   * @param reason
   */
  abort(reason?: REASON) {
    if (this._isAborted) {
      return;
    }
    this._isAborted = true;
    // 写入原因
    this._afterAborted_po?.resolve((this._abortReason = reason));
    this._abortedPromise_po?.reject(reason);
    /// 中断正在进行中的任务
    for (const {
      aborter,
      runtimErrorStack,
    } of this._waitTaskAborterWM.values()) {
      let err: Error | unknown;
      if (reason instanceof Error) {
        const cloneErr = new (reason.constructor as typeof Error)(
          reason.message
        );
        cloneErr.stack =
          (reason.stack ? reason.stack + "\n(abort)\n" : "") + runtimErrorStack;
        err = cloneErr;
      } else if (typeof reason === "string") {
        const wrapError = new Error(reason);
        wrapError.stack =
          (wrapError.stack || "").split("\n")[0] + "\n" + runtimErrorStack;
        err = wrapError;
      } else {
        err = reason;
      }
      aborter.reject(err);
    }
  }
}
