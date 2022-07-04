declare namespace BFChainUtil {
  interface AborterWrapper {
    wrapAsync<R>(task: R): Promise<PromiseType<R>>;
    wrapAsyncRunner<ARGS extends any[], R>(
      task: (...args: ARGS) => R
    ): (...args: ARGS) => Promise<PromiseType<R>>;
    wrapAsyncIterator<I>(
      aIterator: AsyncIterableIterator<I>
    ): AsyncGenerator<I, void, unknown>;
    wrapAsyncIteratorReturn<R>(
      aIterator: AsyncGenerator<unknown, R, unknown>
    ): Promise<R>;
  }
  interface Aborter<REASON = unknown> extends AborterWrapper {
    hasLabel(label: Aborter.Label): boolean;
    // wait<R>(task: R, label?: Aborter.Label): R;
    wrapAsync<R>(task: R, label?: Aborter.Label): Promise<PromiseType<R>>;
    wrapAsyncRunner<ARGS extends any[], R>(
      task: (...args: ARGS) => R,
      label?: symbol
    ): (...args: ARGS) => Promise<PromiseType<R>>;
    wrapAsyncIterator<I>(
      aIterator: AsyncIterableIterator<I>
    ): AsyncGenerator<I, void, unknown>;
    wrapAsyncIteratorReturn<R>(
      aIterator: AsyncGenerator<unknown, R, unknown>
    ): Promise<R>;
    readonly abortReason?: REASON;
    readonly isAborted: boolean;
    afterAborted: Promise<REASON | undefined>;
    abortedPromise: Promise<never>;
    /**
     * @param reason
     */
    abort(reason?: REASON): void;
  }
  namespace Aborter {
    type Label = symbol | string | number;
  }
}
