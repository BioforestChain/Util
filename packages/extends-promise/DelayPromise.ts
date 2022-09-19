/**
 * 在调用.then或者.catch的时候才会执行启动函数
 */

const THEN_SYMBOL = Symbol("then");
const CATCH_SYMBOL = Symbol("catch");
export class DelayPromise<T> {
  static THEN_SYMBOL = THEN_SYMBOL;
  static CATCH_SYMBOL = CATCH_SYMBOL;
  promise: Promise<T> & {
    [THEN_SYMBOL]: Promise<T>["then"];
    [CATCH_SYMBOL]: Promise<T>["catch"];
  };
  constructor(
    executor: (
      resolve: (value?: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    let _resolve: any;
    let _reject: any;
    const promise = new Promise<T>((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });
    this.promise = Object.assign(promise, {
      [THEN_SYMBOL]: promise.then,
      [CATCH_SYMBOL]: promise.catch,
    });
    let is_runed = false;
    const run_executor = () => {
      if (!is_runed) {
        executor(_resolve, _reject);
        is_runed = true;
      }
    };
    promise.then = (onfulfilled?: any, onrejected?: any) => {
      run_executor();
      return this.delayThen(onfulfilled, onrejected) as any;
    };
    promise.catch = (onrejected?: any) => {
      run_executor();
      return this.delayCatch(onrejected) as any;
    };
  }
  delayThen<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise[THEN_SYMBOL](onfulfilled, onrejected);
  }
  delayCatch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): Promise<T | TResult> {
    return this.promise[CATCH_SYMBOL](onrejected);
  }
  /// 直接暴露出then、与catch，可以直接await

  get then() {
    return this.promise.then;
  }
  get catch() {
    return this.promise.catch;
  }
}
