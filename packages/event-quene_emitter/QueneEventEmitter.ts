import {
  cacheGetter,
  renameFunction,
  GetCallerInfo,
  isDev,
  EVENT_DESCRIPTION_SYMBOL,
  eventDebugStyle,
  $EventOptions,
} from "../event-base/index.ts";
import {
  isAsyncGeneratorInstance,
  isGeneratorInstance,
} from "../extends-iterator-is/index.ts";
import {
  $EventInOutMap,
  $QueneEventEmitter,
  $EventInOutHanldersMap,
  $InOutEventHandler,
  $InnerErrorInOutHandler,
} from "./$types.ts";

/**一个极简的事件管理模块 */
export class QueneEventEmitter<EM extends $EventInOutMap>
  implements $QueneEventEmitter<EM>
{
  // IN_K = K | "*",
  TYPE!: EM;
  private _e: $EventInOutHanldersMap<EM> = Object.create(null); // = new Map<EventName, Set<$InOutEventHandler>>();
  /**
   * 增加监听事件
   * @param eventname 事件名
   * @param handler 处理函数
   */
  on<K extends keyof EM>(
    eventname: K,
    handler: $InOutEventHandler<EM[K]>,
    opts: $EventOptions = {}
  ) {
    let handlerMap = this._e[eventname];
    if (!handlerMap) {
      handlerMap = this._e[eventname] = new Map();
    } else if (handlerMap.has(handler)) {
      console.warn(
        `重复监听[${opts.taskname || eventname.toString()}]事件，可能存在异常`
      );
    }
    if (opts.taskname === undefined) {
      opts.taskname = GetCallerInfo(this.on);
    }
    handlerMap.set(handler, opts);
  }
  /**一次性事件监听 */
  once<K extends keyof EM>(
    eventname: K,
    handler: $InOutEventHandler<EM[K]>,
    opts?: Omit<$EventOptions, "once">
  ) {
    return this.on(
      eventname,
      handler,
      opts
        ? new Proxy(opts, {
            get(target, prop, rec) {
              if (prop === "once") {
                return true;
              }
              return Reflect.get(target, prop, rec);
            },
          })
        : { once: true }
    );
  }
  /**
   * 判断事件是否被监听
   * @param eventname 事件名
   * @param handler 处理函数
   */
  // has(eventname: EventName, handler?: EventHandler) {
  has<K extends keyof EM>(eventname: K, handler?: $InOutEventHandler<EM[K]>) {
    const handlerNao = this._e[eventname];
    if (handlerNao) {
      return handler ? handlerNao.has(handler) : handlerNao.size > 0;
    }
    return false;
  }
  /**
   * 取消事件监听
   * @param eventname 事件名
   * @param handler 处理函数
   */
  // off(eventname: EventName, handler: EventHandler) {
  off<K extends keyof EM>(eventname: K, handler: $InOutEventHandler<EM[K]>) {
    const handlerMap = this._e[eventname];
    let deleted = false;
    /// 移除事件监听，如果事件存储器空了，那么删除存储器
    if (
      handlerMap &&
      (deleted = handlerMap.delete(handler)) &&
      handlerMap.size === 0
    ) {
      delete this._e[eventname];
    }
    return deleted;
  }
  get [EVENT_DESCRIPTION_SYMBOL]() {
    return "";
  }

  /**触发事件监听 */
  emit<K extends keyof EM>(
    eventname: K,
    data: EM[K]["in"]
  ): EM[K]["out"] | Promise<EM[K]["out"]> | undefined {
    const handlerMap = this._e[eventname];
    if (handlerMap) {
      if (isDev) {
        if (handlerMap.size) {
          console.log(
            ...eventDebugStyle.head(
              "%s QUENE EMIT [%s]",
              eventDebugStyle.DARKVIOLET_BOLD_UNDERLINE
            ),
            this[EVENT_DESCRIPTION_SYMBOL] || this,
            eventname,
            data
          );
        }
      }
      const iterator = handlerMap.entries();
      const openAg = (
        res:
          | EM[K]["out"]
          | AsyncGenerator<unknown, EM[K]["out"]>
          | Generator<unknown, EM[K]["out"]>
      ) => {
        if (typeof res === "object") {
          if (isAsyncGeneratorInstance(res)) {
            return (async () => {
              try {
                const ag = (res as AsyncGenerator<unknown, EM[K]["out"]>)[
                  Symbol.asyncIterator
                ]();
                do {
                  const item = await ag.next();
                  if (item.done) {
                    return item.value;
                  }
                } while (true);
              } catch (err) {
                this._emitErrorHanlder(err, eventname, data);
              }
            })();
          } else if (isGeneratorInstance(res)) {
            const sg = (res as Generator<unknown, EM[K]["out"]>)[
              Symbol.iterator
            ]();
            try {
              do {
                const item = sg.next();
                if (item.done) {
                  return item.value;
                }
              } while (true);
            } catch (err) {
              this._emitErrorHanlder(err, eventname, data);
            }
          }
        }
        return res as EM[K]["out"];
      };
      const next = (): EM[K]["out"] | Promise<EM[K]["out"]> => {
        const item = iterator.next();
        if (!item.done) {
          const [handler, opts] = item.value;
          try {
            if (isDev) {
              console.log(
                ...eventDebugStyle.head(
                  "RUN [%s]",
                  eventDebugStyle.DARKVIOLET_BOLD_UNDERLINE
                ),
                handler.name
              );
            }
            const res = handler(data, next);
            if (res instanceof Promise) {
              return res.then(openAg, (err) =>
                this._emitErrorHanlder(err, eventname, data)
              );
            } else {
              return openAg(res);
            }
          } catch (err) {
            this._emitErrorHanlder(err, eventname, data);
          } finally {
            if (opts.once) {
              handlerMap.delete(handler);
            }
          }
        }
      };
      return next();
    }
  }
  async *emitToAsyncGenerator<K extends keyof EM>(
    eventname: K,
    data: EM[K]["in"]
  ) {
    const handlerMap = this._e[eventname];
    if (handlerMap) {
      if (isDev) {
        if (handlerMap.size) {
          console.log(
            ...eventDebugStyle.head(
              "%s QUENE EMIT [%s]",
              eventDebugStyle.DARKVIOLET_BOLD_UNDERLINE
            ),
            this[EVENT_DESCRIPTION_SYMBOL] || this,
            eventname,
            data
          );
        }
      }

      // const ags = new Set<AsyncGenerator>();
      const iterator = handlerMap.entries();

      const next = async function* (
        this: QueneEventEmitter<EM>
      ): AsyncGenerator<unknown, void | EM[K]["out"], unknown> {
        const item = iterator.next();
        if (!item.done) {
          const [handler, opts] = item.value;
          try {
            if (isDev) {
              console.log(
                ...eventDebugStyle.head(
                  "RUN [%s]",
                  eventDebugStyle.DARKVIOLET_BOLD_UNDERLINE
                ),
                handler.name
              );
            }
            yield;
            const res = await handler(data, next);
            if (typeof res === "object") {
              if (
                isAsyncGeneratorInstance<
                  AsyncGenerator<unknown, EM[K]["out"], unknown>
                >(res)
              ) {
                return yield* res;
              } else if (
                isGeneratorInstance<Generator<unknown, EM[K]["out"], unknown>>(
                  res
                )
              ) {
                return yield* res;
              }
            }
            return res as Awaited<EM[K]["out"]>;
          } catch (err) {
            this._emitErrorHanlder(err, eventname, data);
          } finally {
            if (opts.once) {
              handlerMap.delete(handler);
            }
          }
        }
      }.bind(this);

      return yield* next();
    }
  }
  clear(
    opts: {
      ignoreCustomErrorHanlder?: boolean;
    } = {}
  ) {
    this._e = Object.create(null);

    const { ignoreCustomErrorHanlder } = opts;

    /// 默认清理掉自定义错误的回调合集
    if (!ignoreCustomErrorHanlder && this._hasEmitErrorHandlerSet) {
      this._emitErrorHandlerSet.clear();
    }
  }

  //#region 同名拓展
  @cacheGetter
  get removeAllListeners() {
    return this.clear;
  }
  @cacheGetter
  get addListener() {
    return this.on;
  }
  @cacheGetter
  get removeListener() {
    return this.off;
  }
  //#endregion

  //#region on emit error

  /**
   * 触发内部的异常处理函数
   * @param err
   * @param han
   * @param name
   */
  protected _emitErrorHanlder<K extends keyof EM>(
    err: unknown,
    // hanlder: $MutArgEventHandler<EM[K]>,
    eventname: K,
    arg: EM[K]["in"]
  ) {
    if (this._hasEmitErrorHandlerSet) {
      for (const errorHanlder of this._emitErrorHandlerSet) {
        /// 这里如果还是异常就不作处理了，直接抛到未捕获异常中就好
        errorHanlder(err, { eventname, arg });
      }
    } else {
      if (isDev) {
        console.error(
          `QueneEventEmitter '${
            this.constructor.name
          }' emit '${eventname.toString()}' fail:`,
          err
        );
      }
      throw err;
    }
  }
  /**是否由过自定义异常处理 */
  private _hasEmitErrorHandlerSet?: true;
  @cacheGetter
  private get _emitErrorHandlerSet() {
    this._hasEmitErrorHandlerSet = true;
    return new Set<$InnerErrorInOutHandler<EM>>();
  }
  /**
   * 自定义函数执行异常处理器
   * @param errorHandler
   */
  onError(errorHandler: $InnerErrorInOutHandler<EM>, taskname?: string) {
    if (typeof taskname === "string") {
      renameFunction(errorHandler, taskname);
    }
    if (this._emitErrorHandlerSet.has(errorHandler)) {
      console.warn(
        `hanlder '${errorHandler.name}' already exits in custom error hanlder event set.`
      );
    }
    this._emitErrorHandlerSet.add(errorHandler);
  }
  /**
   * 移除自定义函数的执行异常处理器
   * @param errorHandler
   */
  offError(errorHandler?: $InnerErrorInOutHandler<EM>) {
    if (!this._hasEmitErrorHandlerSet) {
      return false;
    }

    if (errorHandler) {
      return this._emitErrorHandlerSet.delete(errorHandler);
    }

    this._emitErrorHandlerSet.clear();
    return true;
  }
  //#endregion
}

// export function syncQueneEventEmitter<EM extends $EventInOutMap>() {
//   return new QueneEventEmitter() as $QueneEventEmitter<EM>;
// }

// const SLEEP_TASK_TI_WM = new WeakMap<Promise<unknown>, any>();
// export const sleep = <R>(ms: number, onresolve?: () => R | PromiseLike<R>) => {
//   let ti: unknown;
//   const task = new Promise<void>(
//     (resolve) =>
//       (ti = setTimeout(() => {
//         SLEEP_TASK_TI_WM.delete(task);
//         resolve();
//       }, ms)),
//   ).then(onresolve);
//   SLEEP_TASK_TI_WM.set(task, ti);
//   return task;
// };
// export const unsleep = (task: ReturnType<typeof sleep>) => {
//   const ti = SLEEP_TASK_TI_WM.get(task);
//   if (ti !== undefined) {
//     SLEEP_TASK_TI_WM.delete(task);
//     clearTimeout(ti);
//   }
// };

// (async () => {
//   const qee = new QueneEventEmitter<{ qaq: $EventInOut<Uint8Array, Uint8Array> }>();
//   {
//     qee.on("qaq", async (data, next) => {
//       // await sleep(1000);
//       return next();
//     });
//     qee.on("qaq", function* (data, next) {
//       // debugger;
//       // yield data;
//       return data;
//     });
//     console.log(await qee.emit("qaq", new Uint8Array([1, 2, 3])));
//     qee.clear();
//   }
//   {
//     qee.on("qaq", async (data, next) => {
//       console.log(1);
//       await sleep(300);
//       console.log(2);
//       return next();
//     });
//     qee.on("qaq", async (data, next) => {
//       console.log(3);
//       await sleep(300);
//       console.log(4);
//       return next();
//     });
//     qee.on("qaq", async function* (data, next) {
//       console.log(5);
//       yield sleep(300);
//       console.log(6);
//       return data;
//     });
//     // console.log(await qee.emit("qaq", 456));
//     const aaa = qee.emitToAsyncGenerator("qaq", new Uint8Array([4, 5, 6]));
//     for await (const _ of aaa) {
//       await sleep(1000);
//       console.log("qaq", _);
//     }
//     console.log(aaa);
//   }
// })();
