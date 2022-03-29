import { cacheGetter } from "@bfchain/util-decorator";
import { EasyMap } from "@bfchain/util-extends-map";

export class EventsMap<K, V> extends EasyMap<K, V[]> {
  constructor(entries?: ReadonlyArray<readonly [K, V[]]> | null) {
    super((eventname) => [], entries);
  }
  add(key: K, hanlder: V) {
    this.forceGet(key).push(hanlder);
  }
  remove(key: K, hanlder: V) {
    const events = this.get(key);
    if (events) {
      const index = events.indexOf(hanlder);
      if (index !== -1) {
        events.splice(index, 1);
        return true;
      }
    }
    return false;
  }
}

export function EventMapIsolation<E extends BFChainUtil.EventEmitter>(eventEmitter: E) {
  const BINDED_EVENTS_MAP = new EventsMap<string, BFChainUtil.MutArgEventHandler<any>>();
  const on_isolation = (eventname: string, handler: BFChainUtil.MutArgEventHandler<any>) => {
    eventEmitter.on(eventname as never, handler);
    BINDED_EVENTS_MAP.add(eventname, handler);
    return proxy;
  };
  const off_isolation = (eventname: string, handler: BFChainUtil.MutArgEventHandler<any>) => {
    if (BINDED_EVENTS_MAP.remove(eventname, handler)) {
      eventEmitter.off(eventname as never, handler);
    }
    return proxy;
  };
  const once_isolation = (eventname: string, handler: BFChainUtil.MutArgEventHandler<any>) => {
    const wrapperHandler = (...args: unknown[]) => {
      BINDED_EVENTS_MAP.remove(eventname, wrapperHandler);
      return handler(...args);
    };
    return on_isolation(eventname, wrapperHandler);
  };
  const clear_isolation = () => {
    for (const [eventname, hanlders] of BINDED_EVENTS_MAP) {
      for (const hanlder of hanlders) {
        eventEmitter.off(eventname as never, hanlder);
      }
    }
    BINDED_EVENTS_MAP.clear();
    return proxy;
  };
  const proxy = new Proxy(eventEmitter, {
    get(target, name, receiver) {
      if (name === "on" || name === "addListener") {
        return on_isolation;
      }
      if (name === "off" || name === "removeListener") {
        return off_isolation;
      }
      if (name === "once") {
        return once_isolation;
      }
      if (name === "removeAllListeners" || name === "clear") {
        return clear_isolation;
      }
      return Reflect.get(target, name, receiver);
    },
  });
  return proxy;
}

/**
 * 事件绑定隔离器
 * 在使用事件清除的时候（`off`,`clear`），能之清理有经过隔离器来进行绑定的事件
 */
export class EventCleanerIsolation<
  T extends BFChainUtil.EventMap
  // EE extends BFChainUtil.EventEmitter<T>,
  // EE extends  BFChainUtil.EventEmitter ,
  // T extends  BFChainUtil.EmitterEvents<EE>
> implements BFChainUtil.EventEmitter<T> {
  constructor(private eventEmitter: BFChainUtil.EventEmitter<T>) {}
  public readonly BINDED_EVENTS_MAP = new EventsMap<keyof T, BFChainUtil.MutArgEventHandler<any>>();
  on<K extends keyof T>(
    eventname: K,
    handler: BFChainUtil.MutArgEventHandler<T[K]>,
    opts?: BFChainUtil.EventOptions,
  ) {
    this.eventEmitter.on(eventname, handler, opts);
    this.BINDED_EVENTS_MAP.add(eventname, handler);
    return this;
  }
  off<K extends keyof T>(eventname: K, handler: BFChainUtil.MutArgEventHandler<T[K]>) {
    if (this.BINDED_EVENTS_MAP.remove(eventname, handler)) {
      this.eventEmitter.off(eventname, handler);
    }
    return this;
  }
  emit<K extends keyof T>(eventname: K, ...data: BFChainUtil.MutArg<T[K]>) {
    this.eventEmitter.emit(eventname, ...data);
    return this;
  }
  once<K extends keyof T>(
    eventname: K,
    handler: BFChainUtil.MutArgEventHandler<T[K]>,
    opts?: BFChainUtil.EventOptions,
  ) {
    const wrapperHandler = (...args: BFChainUtil.MutArg<T[K]>) => {
      this.BINDED_EVENTS_MAP.remove(eventname, wrapperHandler);
      return handler(...args);
    };
    this.BINDED_EVENTS_MAP.add(eventname, wrapperHandler);
    this.eventEmitter.once(eventname, handler, opts);
    return this;
  }
  removeAllListeners() {
    for (const [eventname, hanlders] of this.BINDED_EVENTS_MAP) {
      for (const hanlder of hanlders) {
        this.eventEmitter.off(eventname, hanlder);
      }
    }
    this.BINDED_EVENTS_MAP.clear();
    return this;
  }
  //#region 同名拓展
  @cacheGetter
  get clear() {
    return this.removeAllListeners;
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

  /**导出类型 */
  TYPE!: T;
}

/**
 * 事件隔离绑定器
 * 针对`EventTarget`类型
 */
export class EventTargetCleanerIsolation<ET extends EventTarget> implements EventTarget {
  constructor(private eventTarget: ET) {}

  public readonly BINDED_EVENTS_MAP = new EventsMap<string, EventListenerOrEventListenerObject>();
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    const res = this.eventTarget.addEventListener(type, listener, options);
    if (listener) {
      this.BINDED_EVENTS_MAP.add(type, listener);
    }
    return res;
  }

  dispatchEvent(event: Event) {
    return this.eventTarget.dispatchEvent(event);
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ) {
    const res = this.eventTarget.removeEventListener(type, callback, options);
    if (callback) {
      this.BINDED_EVENTS_MAP.remove(type, callback);
    }
  }

  clearAll() {
    for (const [eventname, hanlders] of this.BINDED_EVENTS_MAP) {
      for (const hanlder of hanlders) {
        this.eventTarget.removeEventListener(eventname, hanlder);
      }
    }
    this.BINDED_EVENTS_MAP.clear();
    return this;
  }
}
