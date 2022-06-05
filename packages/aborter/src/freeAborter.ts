class FreeAborter implements BFChainUtil.AborterWrapper {
    wrapAsync<R>(task: R,): Promise<BFChainUtil.PromiseType<R>> {
        return task as any
    }
    wrapAsyncRunner<ARGS extends any[], R>(task: (...args: ARGS) => R,): (...args: ARGS) => Promise<PromiseType<R>> {
        return task as any
    }
    wrapAsyncIterator<I>(aIterator: AsyncIterableIterator<I>): AsyncGenerator<I, void, unknown> {
        return aIterator as any
    }
    async wrapAsyncIteratorReturn<R>(aIterator: AsyncGenerator<unknown, R, unknown>): Promise<R> {
        do {
            const item = await aIterator.next()
            if (item.done) {
                return item.value
            }
        } while (true)
    }
}
/** 零成本的 aborter wrapper
 * 一般用于需要aborter环境的默认参数
 * ```ts
 * function foo(aborter = freeAborter) {
 *      await aborter.wrapAsync(bar())
 * }
 * ```
 */
export const freeAborter = new FreeAborter()