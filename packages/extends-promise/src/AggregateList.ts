/**任务收集器
 * ```
 * const tl = new AggregateList();
 * tl.next = sleep(1)
 * tl.next = sleep(2)
 * await tl.toPromise();
 * ```
 */
export class AggregateList<T = any> {
  // private _tasks = new Set<Promise<T> | T>();
  private _toPromise?: { promise: Promise<void>; resolve: Function; reject: Function };
  private _errors: unknown[] = [];
  toPromise() {
    if (this._total === this._finished) {
      if (this._errors.length) {
        return Promise.reject(this._getError());
      }
      return Promise.resolve();
    }
    if (this._toPromise === undefined) {
      let resolve: Function;
      let reject: Function;
      const promise = new Promise<void>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });
      this._toPromise = {
        promise,
        resolve: resolve!,
        reject: reject!,
      };
    }
    return this._toPromise.promise;
  }
  private _total = 0;
  private _finished = 0;
  set next(task: Promise<T> | T) {
    if (task instanceof Promise || (task && (task as any).then instanceof Function)) {
      this._total += 1;
      (task as Promise<never>).then(this._onSuccess, this._onError);
    }
  }
  private _onSuccess() {
    this._finished += 1;
    if (this._total === this._finished && this._toPromise) {
      if (this._errors.length === 0) {
        this._toPromise.resolve();
      } else {
        this._toPromise.reject(this._getError());
      }
      this._reset();
    }
  }
  private _onError(err: unknown) {
    this._finished += 1;
    this._errors.push(err);
    if (this._total === this._finished && this._toPromise) {
      this._toPromise.reject(this._getError());
      this._reset();
    }
  }
  private _reset() {
    this._toPromise = undefined;
    this._errors = [];
    this._finished = 0;
    this._total = 0;
  }

  private _getError() {
    const errors = Object.freeze(this._errors);
    const message = errors.length === this._total ? "All Promise rejeced" : "Some Promise rejected";
    const aggregateError = new Error(message);

    Object.defineProperty(aggregateError, "errors", {
      value: errors,
      writable: false,
    });
    aggregateError.name = "AggregateError";
    return aggregateError;
  }
  constructor() {
    this._onSuccess = this._onSuccess.bind(this);
    this._onError = this._onError.bind(this);
  }
}
export const wrapAggregateList = async <T = any>(
  cb: (aggregateList: AggregateList<T>) => unknown,
) => {
  const aggregateList = new AggregateList();
  try {
    await cb(aggregateList);
  } catch (err) {
    aggregateList.next = Promise.reject(err);
  }
  return aggregateList.toPromise();
};
