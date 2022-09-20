import { cacheGetter } from "../decorator/index.ts";
import { $MutArgEventHandler } from "../event-base/$types.ts";
import { EventEmitter } from "../event/index.ts";
import { PromiseOut } from "../extends-promise-out/index.ts";
import { $ignoreAwait } from "../typings/index.ts";
import { DelayPromise } from "./DelayPromise.ts";
import { PromiseAbortError } from "./PromiseAbortError.ts";

/**
 * PromiseOut的加强版
 * 提供了中断、跟随
 *
 */
export class PromisePro<T> extends PromiseOut<T> {
  constructor() {
    super();
  }
  get is_done() {
    return this.is_resolved || this.is_rejected;
  }
  abort_error?: PromiseAbortError;
  abort(abort_message = "Abort") {
    if (this.is_done) {
      return;
    }
    this.reject((this.abort_error = new PromiseAbortError(abort_message)));
    this._hasAbortEvent &&
      this._abortEvent.emit("abort", this.abort_error, this);
  }

  private _hasAbortEvent?: true;
  @cacheGetter
  get _abortEvent() {
    this._hasAbortEvent = true;
    return new EventEmitter<{
      abort: [PromiseAbortError, PromisePro<T>];
    }>();
  }
  onAbort(cb: $MutArgEventHandler<[PromiseAbortError, PromisePro<T>]>) {
    this._abortEvent.on("abort", cb);
  }
  follow(from_promise: Promise<T>) {
    from_promise.then(this.resolve).catch(this.reject);
    return this.promise;
  }
  static fromPromise<T>(promise: Promise<T>) {
    const res = new PromisePro<T>();
    if (promise instanceof DelayPromise) {
      $ignoreAwait(promise.delayThen(res.resolve, res.reject));
    } else {
      $ignoreAwait(promise.then(res.resolve, res.reject));
    }
    return res;
  }
  finally(cb?: () => void) {
    return this.promise.finally(cb);
  }
}
