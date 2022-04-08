declare namespace BFChainUtil.MixAsyncIterator {
  type AG<NextOut = unknown, Return = unknown, NextIn = unknown> = [NextOut, Return, NextIn];
  type Gen<T extends AG, B extends boolean = boolean> = {
    name: string;
    runner: AsyncIterator<T[0], T[1], T[2]>;
    /**替补元素/惰性元素
     * 意味着只有到不得不用的时候才会去使用
     */
    bench: B;
    /**当前的步伐 */
    currentStep: IteratorResult<T[0], T[1]> | undefined;
    /**偷跑的步数，默认是0
     * 偷跑意味着它始终会努力提供jumpGun个result
     * 替补元素也可以偷跑，但只有轮到它上场才能偷跑
     */
    jumpGun: number;
    /**缓存在队列中的步伐数 */
    inQueueSteps: number;
  };
  type Result<T extends AG> = {
    step: IteratorResult<T[0], T[1]>;
    from?: Gen<T>;
  };
  type ResultWithFrom<T extends AG, B extends boolean = boolean> = {
    step: IteratorResult<T[0], T[1]>;
    from: Gen<T, B>;
  };
  type Error<T extends AG> = {
    from: Gen<T>;
    reason: unknown;
  };
}
