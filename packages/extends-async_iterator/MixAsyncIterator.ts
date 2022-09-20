// import { Evt } from "evt";
import { safePromiseThen, PromiseOut } from "../extends-promise/index.ts";
import { FastQuene } from "../extends-array/index.ts";
import { $MixAsyncIterator } from "./$types.ts";

const DONE = Promise.resolve({
  step: { value: undefined, done: true as const },
});

export class MixAsyncIterator<
  T extends $MixAsyncIterator.AG = $MixAsyncIterator.AG
> {
  private _allGenList = new FastQuene<$MixAsyncIterator.Gen<T>>();
  join(
    runner: AsyncIterator<T[0], T[1], T[2]>,
    opts?: { name?: string; bench?: boolean; jumpGun?: number }
  ) {
    let bench = false;
    let jumpGun: number | undefined;
    let name = `gen-${this._allGenList.size + 1}`;
    if (opts !== undefined) {
      opts.name !== undefined && (name = opts.name);
      opts.bench !== undefined && (bench = opts.bench);
      jumpGun = opts.jumpGun;
    }
    if (jumpGun === undefined) {
      jumpGun = bench ? 1 : 1; /**非惰性元素至少抢跑1步 */
    }
    if (bench === false && jumpGun < 1) {
      throw new RangeError("when runner no in bench, jump gun should not be 0");
    }

    return this._join({
      runner,
      name,
      bench,
      jumpGun,
      currentStep: undefined,
      inQueueSteps: 0,
    });
  }
  private _join(gen: $MixAsyncIterator.Gen<T>) {
    this._allGenList.push(gen);
    /// 否则保存到惰性列表中，需要时再使用
    if (gen.bench) {
      this._benchGen.push(gen as $MixAsyncIterator.Gen<T, true>);
    }
    /// 如果是非惰性的，那么直接启动迭代
    else {
      this._handleGen(gen);
    }
    return gen;
  }
  remove(gen: $MixAsyncIterator.Gen<T>) {
    if (this._allGenList.remove(gen)) {
      /// 如果全部归空了，那么将其余在等待中的都关闭掉
      if (this._allGenList.size === 0) {
        do {
          const waiter = this._resultWaiter.shift();
          if (waiter === undefined) {
            break;
          }
          waiter.resolve(DONE);
        } while (true);
      }
      return true;
    }
    return false;
  }
  private _enqueueGen(gen: $MixAsyncIterator.Gen<T>) {
    // 是否有在等待中的
    const waiter = this._genWaitter.shift();
    if (waiter) {
      waiter.resolve(gen);
    }
    /// 如果是惰性元素，那么回到惰性队列
    else if (gen.bench) {
      this._benchGen.push(gen as $MixAsyncIterator.Gen<T, true>);
    }
    /// 如果是非惰性元素，那么回到自由队列
    else {
      this._freeGen.push(gen as $MixAsyncIterator.Gen<T, false>);
    }
  }
  private async _dequeueGen() {
    // 获取一个可用的迭代器
    const gen =
      this._freeGen.shift() ||
      this._benchGen.shift() ||
      (await this._genWaitter.push(new PromiseOut()).promise);
    this._handleGen(gen);
  }
  /**正在执行中的任务，等待返回后就从这个集合中移除 */
  private _runnings = new Map<
    Promise<IteratorResult<T[0], T[1]>>,
    $MixAsyncIterator.Gen<T>
  >();
  private _handleGen(gen: $MixAsyncIterator.Gen<T>) {
    const item = gen.runner.next();
    this._runnings.set(item, gen);
    // 如果完成，则回到自由队列
    safePromiseThen(
      item,
      (value) => {
        this._runnings.delete(item);
        // 缓存当前结果
        gen.currentStep = value;
        /// 如果已经完结了，那么直接移除掉了
        if (value.done) {
          this.remove(gen);

          /// 如果没有任何在执行中的元素，就需要继续从队列中读取出来执行，否则外面的Promise就永远无法resolve
          if (this._runnings.size === 0) {
            this._dequeueGen();
          }
        }
        /// 否则回到队列中继续提供下一个迭代
        else {
          // 传递到结果队列中
          this._enqueueResult({ from: gen, step: value });

          /// 如果可以偷跑，那么继续执行
          if (gen.inQueueSteps < gen.jumpGun) {
            this._handleGen(gen);
          } else {
            // 回到空闲队列中
            this._enqueueGen(gen);
          }
        }
      },
      (reason: unknown) => {
        this._runnings.delete(item);
        // 如果已经出错，那么直接移除
        this.remove(gen);
        // 向外传递错误
        // this.onError.post({ from: gen, reason });
      }
    );
  }

  /**候补队列 */
  private _benchGen = new FastQuene<$MixAsyncIterator.Gen<T, true>>();
  /**自由队列 */
  private _freeGen = new FastQuene<$MixAsyncIterator.Gen<T, false>>();
  private _genWaitter = new FastQuene<PromiseOut<$MixAsyncIterator.Gen<T>>>();
  /**入列
   * 这个函数与_handleGen是紧密关联的，是_handleGen的一部分
   */
  private _enqueueResult(result: $MixAsyncIterator.ResultWithFrom<T>) {
    /// 是否有在等待中的
    const waiter = this._resultWaiter.shift();
    if (waiter !== undefined) {
      /**
       * 因为本就是要直接返回的，所以这里直接将步数减去
       *
       * Waiter模式不需要修改inQueueSteps，因为是预约的，直接返回
       */
      waiter.resolve(result);
    } else {
      result.from.bench
        ? this._benchResult.push(
            result as $MixAsyncIterator.ResultWithFrom<T, true>
          )
        : this._freeResult.push(
            result as $MixAsyncIterator.ResultWithFrom<T, false>
          );
      result.from.inQueueSteps += 1;
    }
  }
  /**出列 */
  private _dequeueResult() {
    /// 再从结果队列中读取
    const resultWithFrom1 = this._freeResult.shift();
    if (resultWithFrom1 !== undefined) {
      const gen = resultWithFrom1.from;
      gen.inQueueSteps -= 1;
      if (this._freeGen.remove(gen)) {
        this._handleGen(gen);
      }
      return resultWithFrom1;
    }

    const resultWithFrom2 = this._benchResult.shift();
    if (resultWithFrom2 !== undefined) {
      const gen = resultWithFrom2.from;
      gen.inQueueSteps -= 1;
      if (this._benchGen.remove(gen)) {
        this._handleGen(gen);
      }
      /**
       * @TODO 使用了候补元素，那么就要对元素尽快进行补充
       */
      return resultWithFrom2;
    }

    // 否则排队进行等待，Waiter模式不需要修改inQueueSteps，因为是预约的，直接返回
    const resultPromise = this._resultWaiter.push(new PromiseOut()).promise;
    /// 必要时，让选手出列
    if (
      // 如果没有任何一个在运行中的任务：那么立刻执行
      this._runnings.size === 0 ||
      // 如果自由队列为空，但是候补队列有存在的：那么也立刻执行
      (this._freeGen.size === 0 && this._benchGen.size !== 0)
    ) {
      this._dequeueGen();
    }
    // console.log(++this._traceCount);
    // if (this._traceCount === 2) {
    //   debugger;
    // }
    return resultPromise;
  }
  // private _traceCount = 0;
  private _freeResult = new FastQuene<
    $MixAsyncIterator.ResultWithFrom<T, false>
  >();
  private _benchResult = new FastQuene<
    $MixAsyncIterator.ResultWithFrom<T, true>
  >();
  private _resultWaiter = new FastQuene<
    PromiseOut<$MixAsyncIterator.Result<T>>
  >();
  // readonly onError = new Evt<MixAsyncIterator.Error<T>>();
  next() {
    if (this.isDone) {
      return DONE as Promise<$MixAsyncIterator.Result<T>>;
    }
    return this._dequeueResult();
  }
  get isDone() {
    return (
      /* _allGenList为空也就意味着_running为空 */ this._allGenList.size === 0 &&
      this._freeResult.size === 0 &&
      this._benchResult.size === 0
    );
  }
  async *toAsyncIterator() {
    while (true) {
      const result = await this.next();
      if (result.step.done) {
        return;
      }
      yield result.step.value;
    }
  }
  async toPromise() {
    while (true) {
      const result = await this.next();
      if (result.step.done) {
        return;
      }
    }
  }
}
