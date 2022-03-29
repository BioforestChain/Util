declare namespace BFChainUtil {
  //#region EventEmitterPro
  type EventWaitterMap<EM> = {
    [key in keyof EM]?: import("@bfchain/util-extends-promise-out").PromiseOut<EM[key]>;
  };
  //#endregion

  //#region events

  interface QueneEventEmitter<EM extends EventInOutMap = {}> {
    on<K extends keyof EM>(
      eventname: K,
      handler: InOutEventHandler<EM[K]>,
      opts?: EventOptions,
    ): unknown;
    once<K extends keyof EM>(
      eventname: K,
      handler: InOutEventHandler<EM[K]>,
      opts?: Omit<EventOptions, "once">,
    ): unknown;
    has<K extends keyof EM>(eventname: K, handler?: InOutEventHandler<EM[K]>): boolean;
    off<K extends keyof EM>(eventname: K, handler: InOutEventHandler<EM[K]>): boolean;
    emit<K extends keyof EM>(
      eventname: K,
      data: EM[K]["in"],
    ): EM[K]["out"] | Promise<EM[K]["out"]> | undefined;
    TYPE: EM;
  }
  interface QueneEventEmitterPro<EM extends EventInOutMap = {}> extends QueneEventEmitter<EM> {
    onEmit(
      commonHanlder: MutArgEventHandler<InnerAnyInOutHandlerArg<EM>>,
      opts?: EventOptions,
    ): void;
    offEmit(commonHanlder: MutArgEventHandler<InnerAnyInOutHandlerArg<EM>>): boolean;
  }

  interface SyncQueneEventEmitter<EM extends EventInOutMap = {}> extends QueneEventEmitter<EM> {
    on<K extends keyof EM>(
      eventname: K,
      handler: InOutSyncEventHandler<EM[K]>,
      opts?: EventOptions,
    ): void;
    has<K extends keyof EM>(eventname: K, handler?: InOutSyncEventHandler<EM[K]>): boolean;
    off<K extends keyof EM>(eventname: K, handler: InOutSyncEventHandler<EM[K]>): boolean;
    emit<K extends keyof EM>(eventname: K, data: EM[K]["in"]): EM[K]["out"] | undefined;
  }
  interface SyncQueneEventEmitterPro<EM extends EventInOutMap = {}>
    extends QueneEventEmitterPro<EM> {
    on<K extends keyof EM>(
      eventname: K,
      handler: InOutSyncEventHandler<EM[K]>,
      opts?: EventOptions,
    ): void;

    has<K extends keyof EM>(eventname: K, handler?: InOutSyncEventHandler<EM[K]>): boolean;

    off<K extends keyof EM>(eventname: K, handler: InOutSyncEventHandler<EM[K]>): boolean;
    emit<K extends keyof EM>(eventname: K, data: EM[K]["in"]): EM[K]["out"] | undefined;
  }

  //#endregion
}
