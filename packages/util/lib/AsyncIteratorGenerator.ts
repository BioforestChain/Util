import { bindThis } from "../../decorator/index.ts";
import {
  $EventHandler,
  $EventInOut,
} from "../../event-quene_emitter/$types.ts";
import { QueneEventEmitter } from "../../event/index.ts";
import { PromiseOut } from "../../extends-promise-out/index.ts";
import { $AllArgument, $ignoreAwait } from "../../typings/index.ts";

/**异步迭代器生成器，@WZX 可能会用到 */
export class AsyncIteratorGenerator<T> extends QueneEventEmitter<{
  requestAll: $EventInOut<void>;
  requestItem: $EventInOut</* index */ number, void>;
  push: $EventInOut<{ item: T; index: number }, void>;
  pushCalc: $EventInOut<{ calc: () => T; index: number }, void>;
  done: $EventInOut<void>;
  error: $EventInOut<unknown>;
}> {
  readonly list = [] as T[];
  /**下一个坐标的最小值 */
  min_next_index = 0;
  canPush(index: number) {
    return !(index < this.min_next_index || index in this.list || this.is_done);
  }
  @bindThis
  push(item: T, index = this.min_next_index) {
    if (index < this.min_next_index) {
      throw new RangeError(
        `push into wrong index:${index}, should be ${this.min_next_index}`
      );
    }
    if (index in this.list || index in this.calcs) {
      throw new TypeError(`index:${index} already have value`);
    }
    this.list[index] = item;
    while (this.list[this.min_next_index]) {
      this.min_next_index += 1;
    }
    return this.emit("push", { item, index });
  }

  private calcs: (() => T)[] = [];
  @bindThis
  pushCalc(calc: () => T, index = this.min_next_index) {
    if (index < this.min_next_index) {
      throw new RangeError(
        `push into wrong index:${index}, should be ${this.min_next_index}`
      );
    }
    if (index in this.list || index in this.calcs) {
      throw new TypeError(`index:${index} already have value`);
    }
    const setListCalc = () => {
      delete this.calcs[index];
      const item = (this.list[index] = calc());
      this.emit("push", { item, index });
      return item;
    };
    this.calcs[index] = setListCalc;
    while (this.list[this.min_next_index]) {
      this.min_next_index += 1;
    }
    return this.emit("pushCalc", { calc: setListCalc, index });
  }
  get is_done() {
    return this._is_rejected || this._is_resolved;
  }
  private _is_rejected = false;
  private _is_resolved = false;
  private _task?: PromiseOut<T[]>;
  private _initTask() {
    let task = this._task;
    if (!task) {
      task = this._task = new PromiseOut();
      if (this._is_rejected) {
        task.reject(this._reason);
      } else if (this._is_resolved) {
        task.resolve(this.list);
      } else {
        this._requestProcess = Infinity;
        this.emit("requestAll", undefined);
      }
    }
    return task.promise;
  }
  //  = new PromiseOut<T[]>();
  @bindThis
  async done() {
    if (!this.is_done) {
      this._is_resolved = true;
      this._task?.resolve(this.list);
      do {
        const calcKeys = new Set(Object.keys(this.calcs));
        if (calcKeys.size === 0) {
          break;
        }
        await new Promise<void>((resolve, reject) => {
          const off = () => {
            this.off("push", afterCalc);
            this.off("error", onError);
          };
          const afterCalc = (info: { index: number }) => {
            if (calcKeys.delete(info.index.toString())) {
              if (calcKeys.size === 0) {
                resolve();
                off();
              }
            }
          };
          const onError = () => {
            reject();
            off();
          };
          this.on("push", afterCalc);
          this.once("error", onError);
        });
      } while (true);

      Object.freeze(this.list);
      /**
       * 这里只需要去做一个简单的返回操作就行
       * 并不是为了等待done的事件触发完成
       * 而只是确保异常能被正常捕捉
       */
      return this.emit("done", undefined);
    }
  }
  private _reason?: unknown;
  @bindThis
  throw(err: unknown) {
    if (!this.is_done) {
      this._is_rejected = true;
      this._task?.reject(err);
      Object.freeze(this.list);
      /**
       * 这里只需要去做一个简单的返回操作就行
       * 并不是为了等待error的事件触发完成
       * 而只是确保异常能被正常捕捉
       */
      return this.emit("error", (this._reason = err));
    }
  }
  @bindThis
  resolve() {
    return this.done();
  }
  @bindThis
  reject(err: unknown) {
    return this.throw(err);
  }
  @bindThis
  then(...args: $AllArgument<Promise<T[]>["then"]>) {
    return this._initTask().then(...args);
  }
  @bindThis
  catch(...args: $AllArgument<Promise<T[]>["catch"]>) {
    return this._initTask().catch(...args);
  }

  private _requestProcess = 0;
  get requestProcess() {
    return this._requestProcess;
  }

  [Symbol.asyncIterator]() {
    const self = this;
    const { list, calcs } = self;
    return {
      index: 0,
      return() {
        $ignoreAwait(self.done());
        return Promise.resolve({ done: true as const, value: undefined });
      },
      async next() {
        const need_index = this.index;
        if (calcs[need_index]) {
          $ignoreAwait(calcs[need_index]());
        }
        const value = list[need_index];
        let res = {
          done: self.is_done,
          value,
        };
        if (need_index in list) {
          // 如果有值，那么一定还没结束
          res.done = false;
        } else {
          if (!self.is_done) {
            res = await new Promise((resolve, reject) => {
              const off_bind = () => {
                self.off("error", wait_error);
                self.off("push", wait_next);
                self.off("pushCalc", wait_next_calc);
                self.off("done", wait_done);
              };
              const wait_error: $EventHandler<unknown> = (err, next) => {
                off_bind();
                reject(err);
                return next();
              };
              const wait_done: $EventHandler<void> = (_, next) => {
                off_bind();
                resolve({
                  done: true,
                  value,
                });
                return next();
              };
              const wait_next: $EventHandler<{
                item: T;
                index: number;
              }> = ({ item, index }, next) => {
                if (need_index === index) {
                  off_bind();
                  resolve({ done: false, value: item });
                }
                return next();
              };
              const wait_next_calc: $EventHandler<{
                calc: () => T;
                index: number;
              }> = ({ calc, index }, next) => {
                if (need_index === index) {
                  off_bind();
                  resolve({ done: false, value: calc() });
                }
                return next();
              };
              self.on("error", wait_error);
              self.on("done", wait_done);
              self.on("push", wait_next);
              self.on("pushCalc", wait_next_calc);

              ///
              try {
                const res = self.emit(
                  "requestItem",
                  (self._requestProcess = need_index)
                );
                res?.catch((err) => {
                  self.emit("error", err);
                });
              } catch (err) {
                self.emit("error", err);
              }
            });
            // res = {
            //   // 列表中有值的话那就还没结束
            //   done: self.is_done && !(need_index in list),
            //   value,
            // };
          }
        }

        this.index += 1;
        return res;
      },
    };
  }
  toAsyncIterableIterator() {
    return AII(this);
  }
}

async function* AII<T>(ag: AsyncIteratorGenerator<T>) {
  yield* ag;
}

type ComplexObj<D, E> = {
  [key in keyof Omit<D, keyof E>]?: D[key];
} & E;

type FilterMapDefault = {
  filter?: false;
  map?: unknown;
  maps?: unknown;
  multi?: false;
};
type FilterMap<T> = Readonly<
  | FilterMapDefault
  | ComplexObj<FilterMapDefault, { filter: true; map: T }>
  | ComplexObj<FilterMapDefault, { filter: true; maps: T[]; multi: true }>
>;

export type AsyncMaybeFilterMap<T> =
  | (FilterMap<T> & { async?: false })
  | { async: true; value: PromiseLike<FilterMap<T>> };

/**
 * 管道转移工具，使用 filterMap 哲学
 * @param sourceAg
 * @param filter
 * @param map
 * @param destAg
 */
export const AsyncIteratorGeneratorTransfer = <F, T>(
  sourceAg: AsyncIteratorGenerator<F>,
  destAg: AsyncIteratorGenerator<T>,
  filterMap: (item: F) => AsyncMaybeFilterMap<T>
) => {
  let reqNextPoList: PromiseOut<void>[] | undefined = [new PromiseOut()];
  const getPoAtList = (
    poList: NonNullable<typeof reqNextPoList>,
    index: number
  ) => {
    let po = poList[index];
    if (po === undefined) {
      po = poList[index] = new PromiseOut();
    }
    return po;
  };
  const getPrAtIndex = (index: number) => {
    if (reqNextPoList === undefined) {
      return;
    }
    return getPoAtList(reqNextPoList, index).promise;
  };

  let yieldIndex = 0;
  /// source=>dest
  (async () => {
    /// 等待下一次请求的指令，如果没有指令，那么就冲到底
    await getPrAtIndex(yieldIndex);

    for await (const source of sourceAg) {
      let fm = filterMap(source);
      if (fm.async) {
        fm = await fm.value;
      }
      if (fm.filter) {
        if (fm.multi) {
          for (const map of fm.maps) {
            destAg.push(map);
          }
        } else {
          destAg.push(fm.map);
        }
        /// 等待下一次请求的指令，如果没有指令，那么就冲到底
        await getPrAtIndex(yieldIndex);
      }
    }
    await destAg.done();
  })().catch(destAg.throw);

  /// dest=>source
  destAg.on("done", (_, next) => (sourceAg.done(), next()));
  destAg.on("error", (err, next) => (sourceAg.throw(err), next()));
  destAg.on("requestItem", (_index, next) => {
    /// 这里使用内部自己维护的yieldIndex而不是index，因为destAg可能会被外部自定义push了一些数据，导致index偏差。
    /// 我们只需要准确地传递 for await 触发的次数就好了，只有阻塞的时候才会触发 requestItem，也只有阻塞的时候才需要从sourceAg那边拿数据
    if (reqNextPoList !== undefined) {
      getPoAtList(reqNextPoList, yieldIndex).resolve();
      yieldIndex += 1;
    }
    next();
  });
  destAg.on("requestAll", (_, next) => {
    if (reqNextPoList !== undefined) {
      for (const po of reqNextPoList) {
        if (po.is_resolved === false) {
          po.resolve();
        }
      }
      reqNextPoList = undefined;
    }
    next();
  });
};
