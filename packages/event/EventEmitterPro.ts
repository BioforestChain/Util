import { PromiseOut } from "../extends-promise-out/index.ts";
import {
  cacheGetter,
  isDev,
  GetCallerInfo,
  eventDebugStyle,
  EVENT_DESCRIPTION_SYMBOL,
  $EventOptions,
  $MutArg,
} from "../event-base/index.ts";
import {
  $InnerAnyHandler,
  MapEventEmitter,
} from "../event-map_emitter/index.ts";
import { $EventWaitterMap } from "./index.ts";
import { $EmptyObject } from "../typings/$types.ts";

export class MapEventEmitterPro<
  EM = $EmptyObject,
  EM2 = never
> extends MapEventEmitter<EM, EM2> {
  /**
   * 触发事件
   * @param eventname
   * @param args
   */
  protected _emit<K extends keyof this["TYPE"]>(
    eventname: K,
    args: $MutArg<this["TYPE"][K]>
  ) {
    /**
     * 处理前置的任务
     */
    if (this._hasBeforeTaskMap) {
      const task = this._beforeTasks[eventname];
      if (task) {
        delete this._beforeTasks[eventname];
        task.resolve(args);
      }
    }
    /**
     * 处理通用监听器
     */
    if (this._hasCommonEmitHandlerMap) {
      if (isDev) {
        if (this._commonEmitHandlerMap.size) {
          console.log(
            ...eventDebugStyle.head(
              "%s EMIT WILDCARDS * [%s]",
              eventDebugStyle.MIDNIGHTBLUE_BOLD_UNDERLINE
            ),
            this[EVENT_DESCRIPTION_SYMBOL] || this,
            { eventname, args }
          );
        }
      }
      for (const [commonHanlder, opts] of this._commonEmitHandlerMap) {
        try {
          if (isDev) {
            const { taskname = commonHanlder.name } = opts;
            console.log(
              ...eventDebugStyle.head(
                "RUN [%s]",
                eventDebugStyle.MIDNIGHTBLUE_BOLD_UNDERLINE
              ),
              taskname
            );
          }
          const res = commonHanlder({ eventname, args });
          if (res instanceof Promise) {
            res.catch((err) => this._emitErrorHanlder(err, eventname, args));
          }
        } catch (err) {
          this._emitErrorHanlder(err, eventname, args);
        } finally {
          if (opts.once) {
            this._commonEmitHandlerMap.delete(commonHanlder);
          }
        }
      }
    }

    /// 触发事件
    super._emit(eventname, args);

    /**
     * 处理后置的任务
     */
    if (this._hasAfterTaskMap) {
      const task = this._afterTasks[eventname];
      if (task) {
        delete this._afterTasks[eventname];
        task.resolve(args);
      }
    }
  }
  /**
   * 移除所有的事件
   */
  clear(
    opts: {
      ignoreCommonErrorHanlder?: boolean;
      ignoreBeforeTask?: boolean;
      ignoreAfterTask?: boolean;
      ignoreCustomErrorHanlder?: boolean;
    } = {}
  ) {
    super.clear(opts);

    const { ignoreCommonErrorHanlder, ignoreBeforeTask, ignoreAfterTask } =
      opts;

    if (!ignoreCommonErrorHanlder && this._hasCommonEmitHandlerMap) {
      /// 默认清理掉通用监听的回调合集
      this._commonEmitHandlerMap.clear();
    }
    if (!ignoreBeforeTask && this._hasBeforeTaskMap) {
      /// 默认清理掉once的监听
      const error = new Error("Remove all listeners");
      for (const eventname in this._beforeTasks) {
        (this._beforeTasks[eventname] as PromiseOut).reject(error);
      }
    }
    if (!ignoreAfterTask && this._hasAfterTaskMap) {
      /// 默认清理掉once的监听
      const error = new Error("Remove all listeners");
      for (const eventname in this._afterTasks) {
        (this._afterTasks[eventname] as PromiseOut).reject(error);
      }
    }
  }

  //#region on emit any event
  /**是否有过监听通用事件处理 */
  private _hasCommonEmitHandlerMap?: true;
  @cacheGetter
  private get _commonEmitHandlerMap() {
    this._hasCommonEmitHandlerMap = true;
    return new Map<$InnerAnyHandler<this["TYPE"]>, $EventOptions>();
  }
  /**
   * 监听所有事件
   * @param commonHanlder
   * @param taskname
   */
  onEmit(
    commonHanlder: $InnerAnyHandler<this["TYPE"]>,
    opts: $EventOptions = {}
  ) {
    if (this._commonEmitHandlerMap.has(commonHanlder)) {
      console.warn(
        `hanlder '${commonHanlder.name}' already exits in common hanlder event set.`
      );
    }
    if (opts.taskname === undefined) {
      opts.taskname = GetCallerInfo(this.onEmit);
    }
    this._commonEmitHandlerMap.set(commonHanlder, opts);
  }
  /**
   * 移除所有事件的监听
   * @param commonHanlder
   */
  offEmit(commonHanlder: $InnerAnyHandler<this["TYPE"]>) {
    if (!this._hasCommonEmitHandlerMap) {
      return false;
    }

    if (commonHanlder) {
      return this._commonEmitHandlerMap.delete(commonHanlder);
    }

    this._commonEmitHandlerMap.clear();
    return true;
  }

  //#endregion

  //#region after

  /**是否有使用过after监听器 */
  private _hasAfterTaskMap?: true;
  @cacheGetter
  private get _afterTasks() {
    this._hasAfterTaskMap = true;
    return Object.create(null) as $EventWaitterMap<this["TYPE"]>;
  }
  /**
   * 与once不同，返回promise
   * 这里与常规的监听不同，不需要提供回调函数
   * 在清理事件的时候，它会被触发abort事件
   *
   * 这样设计是因为once事件的行为往往不是为了处理一个事件
   * 而是在等待一个事件，如果基于回调，很容易在清理掉事件的时候，伴随着也将这种等待也清理了
   * 从而陷入了无限的等待，而这往往不是我们所要的
   *
   * 我们当然可以在on函数上增加“被清理时的回调”，这将会更加通用，但同时也意味着清理行为的复杂性增加
   * 我们不需要为那2%的功能牺牲太多，取舍之间，我们选择这样的简单方案来定义`once`的行为
   *
   * @param eventname
   * @param handler
   * @param taskname
   */
  after<K extends keyof this["TYPE"]>(eventname: K): Promise<this["TYPE"][K]> {
    let task = this._afterTasks[eventname];
    if (!task) {
      task = this._afterTasks[eventname] = new PromiseOut();
    }
    return task.promise;
  }
  /**
   * 中断一次性监听器
   * @param eventname
   * @param err
   */
  abortAfter<K extends keyof this["TYPE"]>(eventname: K, err: unknown) {
    const task = this._afterTasks[eventname];
    if (task) {
      task.reject(err);
    }
    return task;
  }
  //#endregion

  //#region before

  /**是否有使用过before监听器 */
  private _hasBeforeTaskMap?: true;
  @cacheGetter
  private get _beforeTasks() {
    this._hasBeforeTaskMap = true;
    return Object.create(null) as $EventWaitterMap<this["TYPE"]>;
  }
  /**
   * 与after类似，只是触发的时机不同
   *
   * @param eventname
   * @param handler
   * @param taskname
   */
  before<K extends keyof this["TYPE"]>(eventname: K): Promise<this["TYPE"][K]> {
    let task = this._beforeTasks[eventname];
    if (!task) {
      task = this._beforeTasks[eventname] = new PromiseOut();
    }
    return task.promise;
  }
  /**
   * 中断一次性监听器
   * @param eventname
   * @param err
   */
  abortBefore<K extends keyof this["TYPE"]>(eventname: K, err: unknown) {
    const task = this._beforeTasks[eventname];
    if (task) {
      task.reject(err);
    }
    return task;
  }
  //#endregion
}
