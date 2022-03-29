import { safePromiseThen } from "./safePromiseThen";
import { PromiseOut } from "@bfchain/util-extends-promise-out";

const enum RankType {
  Rejected,
  Resolved,
}

type RankItem<TS> =
  | { type: RankType.Resolved; value: TS }
  | { type: RankType.Rejected; value?: unknown };
type Thened<TS> = {
  cbs: {
    resolves: Set<(value: TS) => unknown>;
    rejects: Set<(reason: unknown) => unknown>;
  };
  onfulfilled: (value: TS) => void;
  onrejected: (reason: unknown) => void;
  toPromise: PromiseLike<unknown>;
};

/**
 * Promise 竞争器
 */
export class PromiseRace<T, TS = BFChainUtil.PromiseType<T>> {
  constructor(options?: Partial<BFChainUtil.PromiseRaceOptions>) {
    this.options = PromiseRace.mergeOptions(options);
  }
  /**配置 */
  public options: BFChainUtil.PromiseRaceOptions;
  /**合并选项 */
  static mergeOptions(options?: Partial<BFChainUtil.PromiseRaceOptions>) {
    const defaultOptions: BFChainUtil.PromiseRaceOptions = {
      throwWhenNoRacer: false,
    };
    return Object.assign(defaultOptions, options);
  }

  /**排名列表
   * 在输出结果后，将其保存到排行榜上，可以用race函数来获取名单
   */
  private rankList: RankItem<TS>[] = [];
  /**
   * 等待获取最新的 rank 信息的候选者
   */
  private quota?: PromiseOut<TS>;

  /**回调列表 */
  private thenedMap = new Map<PromiseLike<TS>, Thened<TS>>();
  private resolve(value: TS) {
    if (this.quota) {
      this.quota.resolve(value);
      this.quota = undefined;
    } else {
      this.rankList.push({ type: RankType.Resolved, value });
    }
  }
  private reject(reason?: unknown) {
    if (this.quota) {
      this.quota.reject(reason);
      this.quota = undefined;
    } else {
      this.rankList.push({ type: RankType.Rejected, value: reason });
    }
  }
  /**增加竞争者 */
  addRacer(promise: PromiseLike<TS>) {
    const thended = this.thenedMap.get(promise);
    if (!thended) {
      const onfulfilled = (value: TS) => {
        this.resolve(value);
        this.thenedMap.delete(promise);
      };
      const onrejected = (reason: unknown) => {
        this.reject(reason);
        this.thenedMap.delete(promise);
      };
      const { thened, toPromise } = safePromiseThen(promise, onfulfilled, onrejected);
      if (thened.cbs) {
        this.thenedMap.set(promise, { cbs: thened.cbs, onfulfilled, onrejected, toPromise });
      }
      return toPromise;
    }
    return thended.toPromise;
  }
  /**
   * 移除竞争者
   */
  removeRacer(promise: PromiseLike<TS>) {
    const thened = this.thenedMap.get(promise);
    if (thened) {
      this._removeRacer(promise, thened);
      this._checkToEndRace();
      return true;
    }
    return false;
  }
  private _removeRacer(promise: PromiseLike<TS>, thened: Thened<TS>) {
    thened.cbs.resolves.delete(thened.onfulfilled);
    thened.cbs.rejects.delete(thened.onrejected);
    this.thenedMap.delete(promise);
  }
  /**判断是否存在某一个竞争者 */
  hasRacer(promise: PromiseLike<TS>) {
    return this.thenedMap.has(promise);
  }
  /**竞争者数量 */
  get size() {
    return this.thenedMap.size;
  }

  private _queneToCheck() {}
  private _cter = false;

  /**检查竞赛名单，如果没有可用名单，则直接终结竞赛 */
  private _checkToEndRace() {
    /**队列为空时才触发判断 */
    if (this.options.throwWhenNoRacer && this._cter === false && this.thenedMap.size === 0) {
      this._cter = true;
      queueMicrotask(() => {
        /**如果队列为空，且有任务竞赛在执行，直接抛出错误 */
        if (this.thenedMap.size === 0 && this.quota && this.quota.is_finished === false) {
          this.quota.reject(new RangeError("no racer to race"));
        }
      });
    }
  }
  static isNoRacerException(exception: unknown) {
    return exception instanceof RangeError && exception.message === "no racer to race";
  }

  /**进行竞赛 */
  race(outter?: PromiseOut<TS>) {
    /// 获取已经有的排名列表
    const inRank = this.rankList.shift();
    if (!inRank) {
      /// 如果有自定义输出，那么将之与候选名单进行绑定
      if (outter) {
        if (this.quota) {
          if (this.quota !== outter) {
            this.quota.promise.then(outter.resolve, outter.reject);
          }
        } else {
          this.quota = outter;
        }
        return outter.promise;
      }

      /// 检查 空竞赛的异常
      this._checkToEndRace();

      /// 如果没有自定义输出，那么启用候选名单
      return (this.quota || (this.quota = new PromiseOut<TS>())).promise;
    }
    if (inRank.type === RankType.Resolved) {
      return inRank.value;
    } else {
      throw inRank.value;
    }
  }
  /**
   * 清场
   */
  clear(reason?: unknown) {
    for (const item of this.thenedMap) {
      this._removeRacer(item[0], item[1]);
    }
    this.rankList.length = 0;
    if (this.quota) {
      this.quota.reject(reason);
      this.quota = undefined;
    }
  }
}

/**
 * 避免由于某一个promise不终结导致的不释放其它promise引用的维妮塔
 */
export function safePromiseRace<T>(maybePromises: Iterable<T>) {
  type TS = BFChainUtil.PromiseType<T>;
  const res = new PromiseOut<TS>();
  /**
   * 如果存在非promise对象，那么可以直接返回了
   */
  let isAllPromise = true;
  const promises: PromiseLike<TS>[] = [];
  for (const p of maybePromises) {
    if (
      typeof p === "object" &&
      p !== null &&
      typeof (p as unknown as PromiseLike<TS>).then === "function"
    ) {
      promises.push(p as any);
    } else {
      isAllPromise = false;
      res.resolve(p as TS);
      break;
    }
  }
  /**
   * 如果全都是promise那么尝试去等待每一个任务
   */
  if (isAllPromise) {
    if (promises.length === 0) {
      console.warn("safePromiseRace got empty array");
      /// 空长度就是会返回一个pendding的promise
    } else {
      const race = new PromiseRace<T>();
      /// 这里只需要一次性竞赛，完成后就清场
      res.onFinished(() => race.clear());
      for (const p of promises) {
        race.addRacer(p);
      }
      race.race(res);
    }
  }
  return res.promise;
}

// safePromiseRace([1, 2, "s", Promise.reject(), Promise.resolve(), Promise.resolve({ a: 1 })]);
