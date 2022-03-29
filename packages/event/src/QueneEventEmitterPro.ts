import {
  cacheGetter,
  GetCallerInfo,
  isDev,
  EVENT_DESCRIPTION_SYMBOL,
  eventDebugStyle,
} from "@bfchain/util-event-base";
import { QueneEventEmitter } from "@bfchain/util-event-quene-emitter";

/**一个极简的事件管理模块 */
export class QueneEventEmitterPro<EM extends BFChainUtil.EventInOutMap>
  extends QueneEventEmitter<EM>
  implements BFChainUtil.QueneEventEmitterPro<EM> {
  /**触发事件监听 */
  emit<K extends keyof EM>(eventname: K, data: EM[K]["in"]) {
    /**
     * 处理通用监听器
     */
    if (this._hasCommonEmitHandlerMap) {
      if (isDev) {
        if (this._commonEmitHandlerMap.size) {
          const self = this[EVENT_DESCRIPTION_SYMBOL] || this;
          console.log(
            ...eventDebugStyle.head(
              "%s QUENE EMIT WILDCARDS * [%s]",
              eventDebugStyle.DARKVIOLET_BOLD_UNDERLINE,
            ),
            self,
            eventname,
            data,
          );
        }
      }
      for (const [commonHanlder, opts] of this._commonEmitHandlerMap) {
        try {
          if (isDev) {
            const { taskname = commonHanlder.name } = opts;
            console.log(
              ...eventDebugStyle.head("RUN [%s]", eventDebugStyle.DARKVIOLET_BOLD_UNDERLINE),
              taskname,
            );
          }
          const res = commonHanlder({ eventname, args: data });
          if (res instanceof Promise) {
            res.catch((err) => this._emitErrorHanlder(err, eventname, data));
          }
        } catch (err) {
          this._emitErrorHanlder(err, eventname, data);
        } finally {
          if (opts.once) {
            this._commonEmitHandlerMap.delete(commonHanlder);
          }
        }
      }
    }

    /// 触发事件
    return super.emit(eventname, data);
  }
  //#region on emit any event
  /**是否有过监听通用事件处理 */
  private _hasCommonEmitHandlerMap?: true;
  @cacheGetter
  private get _commonEmitHandlerMap() {
    this._hasCommonEmitHandlerMap = true;
    return new Map<BFChainUtil.InnerAnyInOutHandler<EM>, BFChainUtil.EventOptions>();
  }
  /**
   * 监听所有事件
   * @param commonHanlder
   * @param taskname
   */
  onEmit(commonHanlder: BFChainUtil.InnerAnyInOutHandler<EM>, opts: BFChainUtil.EventOptions = {}) {
    if (this._commonEmitHandlerMap.has(commonHanlder)) {
      console.warn(`hanlder '${commonHanlder.name}' already exits in common hanlder event set.`);
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
  offEmit(commonHanlder: BFChainUtil.InnerAnyInOutHandler<EM>) {
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

  /**
   * 移除所有的事件
   */
  clear(
    opts: {
      ignoreCommonErrorHanlder?: boolean;
      ignoreCustomErrorHanlder?: boolean;
    } = {},
  ) {
    super.clear(opts);

    const { ignoreCommonErrorHanlder } = opts;

    if (!ignoreCommonErrorHanlder && this._hasCommonEmitHandlerMap) {
      /// 默认清理掉通用监听的回调合集
      this._commonEmitHandlerMap.clear();
    }
  }
}

export function syncQueneEventEmitterPro<EM extends BFChainUtil.EventInOutMap>() {
  return new QueneEventEmitterPro() as BFChainUtil.QueneEventEmitterPro<EM>;
}
