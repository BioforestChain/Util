import {
  cacheGetter,
  renameFunction,
  GetCallerInfo,
  isDev,
  EVENT_DESCRIPTION_SYMBOL,
  eventDebugStyle,
} from "@bfchain/util-event-base";

export class MapEventEmitter<
  EM = {},
  EM2 = never,
  EMX extends EM | EM2 = EM | EM2
> implements BFChainUtil.EventEmitterMix<EM, EM2>
{
  /**导出类型 */
  TYPE!: EMX;

  private _e: BFChainUtil.EventHanldersMap<EMX> = Object.create(null);
  /**
   * 监听事件
   * 在这里重复的事件不会被重复监听
   * 原因时我们不支持context对象的绑定，一个函数被重复监听，往往是绑定着不同的this对象，使得上下文的值不一样
   * 这里不允许自定义context对象。就意味着函数被重复监听已经是没有必要的事情
   * 如果由类似的需要，需要执行生成一个闭包，这也将重新生成一个新的函数
   * @param eventname
   * @param handler
   * @param taskname
   */
  on<K extends keyof EM>(
    eventname: K,
    handler: BFChainUtil.MutArgEventHandler<EM[K]>,
    opts?: BFChainUtil.EventOptions
  ): void;
  on<K extends keyof EM2>(
    eventname: K,
    handler: BFChainUtil.MutArgEventHandler<EM2[K]>,
    opts?: BFChainUtil.EventOptions
  ): void;
  on<K extends keyof this["TYPE"]>(
    eventname: K,
    handler: any,
    opts: BFChainUtil.EventOptions = {}
  ) {
    this._on(eventname, handler, opts.taskname, opts.once);
  }
  /** on函数的具体实现 */
  private _on<EN extends keyof this["TYPE"]>(
    eventname: EN,
    handler: BFChainUtil.MutArgEventHandler<EMX[EN]>,
    taskname?: string,
    once?: boolean
  ) {
    const eventHanldersMap = this._e;
    let eventSet = eventHanldersMap[eventname];
    if (!eventSet) {
      eventSet = eventHanldersMap[eventname] = new Map();
    } else if (eventSet.has(handler)) {
      console.warn(
        `hanlder '${handler.name}' already exits in event set ${String(
          eventname
        )}.`
      );
    }
    if (taskname === undefined) {
      taskname = GetCallerInfo(this.constructor);
    }
    eventSet.set(handler, {
      taskname,
      once,
    });
  }

  /**一次性事件监听 */
  once<K extends keyof EM>(
    eventname: K,
    handler: BFChainUtil.MutArgEventHandler<EM[K]>,
    opts?: BFChainUtil.OnceEventOptions
  ): unknown;
  once<K extends keyof EM2>(
    eventname: K,
    handler: BFChainUtil.MutArgEventHandler<EM2[K]>,
    opts?: BFChainUtil.OnceEventOptions
  ): unknown;
  once<K extends keyof this["TYPE"]>(
    eventname: K,
    handler: any,
    opts: BFChainUtil.OnceEventOptions = {}
  ) {
    this._on(eventname, handler, opts.taskname, true);
  }

  /**
   * 移除指定处理函数或者选定的事件集合
   * @param eventname
   * @param handler
   */
  off<K extends keyof EM>(
    eventname: K,
    handler?: BFChainUtil.MutArgEventHandler<EM[K]>
  ): boolean;
  off<K extends keyof EM2>(
    eventname: K,
    handler?: BFChainUtil.MutArgEventHandler<EM2[K]>
  ): boolean;
  off<K extends keyof this["TYPE"]>(eventname: K, handler?: any) {
    return this._off(eventname, handler);
  }
  private _off<EN extends keyof this["TYPE"]>(
    eventname: EN,
    handler?: BFChainUtil.MutArgEventHandler<EMX[EN]>
  ) {
    const eventMap = this._e[eventname];
    let res = true;
    if (eventMap) {
      if (handler) {
        const res = eventMap.delete(handler);
        if (res && eventMap.size === 0) {
          delete this._e[eventname];
        }
      } else {
        eventMap.clear();
        delete this._e[eventname];
      }
    } else {
      res = false;
    }
    return res;
  }
  get [EVENT_DESCRIPTION_SYMBOL]() {
    return "";
  }

  emit<K extends keyof EM>(
    eventname: K,
    ...data: BFChainUtil.MutArg<EM[K]>
  ): void;
  emit<K extends keyof EM2>(
    eventname: K,
    ...data: BFChainUtil.MutArg<EM2[K]>
  ): void;
  emit<K extends keyof this["TYPE"]>(eventname: K, ...args: any) {
    this._emit(eventname, args);
  }
  protected _emit<EN extends keyof this["TYPE"]>(
    eventname: EN,
    args: BFChainUtil.MutArg<EMX[EN]>
  ) {
    /**
     * 触发针对性的监听任务
     */
    const eventMap = this._e[eventname];
    if (isDev) {
      console.group(
        ...eventDebugStyle.head(
          "%s EMIT [%s]",
          eventDebugStyle.MIDNIGHTBLUE_BOLD_UNDERLINE
        ),
        this[EVENT_DESCRIPTION_SYMBOL] || this,
        eventname
      );
      console.log(
        ...eventDebugStyle.head(
          "%s ARGS:",
          eventDebugStyle.MIDNIGHTBLUE_BOLD_UNDERLINE
        ),
        ...(args as unknown[])
      );
    }
    if (eventMap) {
      for (const [handler, opts] of eventMap.entries()) {
        try {
          if (isDev) {
            const { taskname = handler.name } = opts;
            console.log(
              ...eventDebugStyle.head(
                "%s RUN [%s]",
                eventDebugStyle.MIDNIGHTBLUE_BOLD_UNDERLINE
              ),
              this[EVENT_DESCRIPTION_SYMBOL] || this,
              taskname
            );
          }
          const res = handler(...args);
          if (res instanceof Promise) {
            res.catch((err) => this._emitErrorHanlder(err, eventname, args));
          }
        } catch (err) {
          this._emitErrorHanlder(err, eventname, args);
        } finally {
          if (opts.once) {
            eventMap.delete(handler);
          }
        }
      }
    }
    isDev && console.groupEnd();
  }

  //#region on emit error

  /**
   * 触发内部的异常处理函数
   * @param err
   * @param han
   * @param name
   */
  protected _emitErrorHanlder<K extends keyof this["TYPE"]>(
    err: unknown,
    eventname: K,
    args: BFChainUtil.MutArg<EMX[K]>
  ) {
    if (this._hasEmitErrorHandlerSet) {
      for (const errorHandler of this._emitErrorHandlerSet) {
        /// 这里如果还是异常就不作处理了，直接抛到未捕获异常中就好
        errorHandler(err, {
          // hanlder: hanlder ,//as BFChainUtil.MutArgEventHandler<EM[keyof EM]>,
          eventname,
          args,
        });
      }
    } else {
      isDev &&
        console.error(
          `EventEmitter '${
            this.constructor.name
          }' emit '${eventname.toString()}' fail:`,
          err
        );
      throw err;
    }
  }
  /**是否由过自定义异常处理 */
  private _hasEmitErrorHandlerSet?: true;
  @cacheGetter
  private get _emitErrorHandlerSet() {
    this._hasEmitErrorHandlerSet = true;
    return new Set<BFChainUtil.InnerErrorHandler<EMX>>();
  }
  /**
   * 自定义函数执行异常处理器
   * @param errorHandler
   */
  onError(errorHandler: BFChainUtil.InnerErrorHandler<EMX>, taskname?: string) {
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
  offError(errorHandler?: BFChainUtil.InnerErrorHandler<EMX>) {
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

  /**
   * 移除所有的事件
   */
  clear(
    opts: {
      ignoreCustomErrorHanlder?: boolean;
    } = {}
  ) {
    /// 直接清理掉
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
}
