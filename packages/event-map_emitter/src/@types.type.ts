declare namespace BFChainUtil {
  //#region EventEmitter

  interface EventEmitter<EM = {}> {
    on<K extends keyof EM>(
      eventname: K,
      handler: MutArgEventHandler<EM[K]>,
      opts?: BFChainUtil.EventOptions
    ): unknown;
    // // on<K extends keyof EM2>(eventname: K, handler: MutArgEventHandler<EM2[K]>): unknown;
    once<K extends keyof EM>(
      eventname: K,
      handler: MutArgEventHandler<EM[K]>,
      opts?: BFChainUtil.EventOptions
    ): unknown;
    // // once<K extends keyof EM2>(eventname: K, handler: MutArgEventHandler<EM2[K]>): unknown;
    off<K extends keyof EM>(
      eventname: K,
      handler?: MutArgEventHandler<EM[K]>
    ): unknown;
    // // off<K extends keyof EM2>(eventname: K, handler?: MutArgEventHandler<EM2[K]>): unknown;
    emit<K extends keyof EM>(eventname: K, ...data: MutArg<EM[K]>): unknown;
    // // emit<K extends keyof EM2>(eventname: K, ...data: MutArg<EM2[K]>): unknown;
    TYPE: EM;
  }

  /**
   * 混合事件，可以用于动态与静态结合
   * 静态确保内部逻辑正确性
   * 动态用于生成实例后的拓展方法的正确性
   */
  type EventEmitterMix<EM1, EM2> = {
    on<K extends keyof EM1>(
      eventname: K,
      handler: MutArgEventHandler<EM1[K]>,
      opts?: BFChainUtil.EventOptions
    ): unknown;
    on<K extends keyof EM2>(
      eventname: K,
      handler: MutArgEventHandler<EM2[K]>,
      opts?: BFChainUtil.EventOptions
    ): unknown;
    once<K extends keyof EM1>(
      eventname: K,
      handler: MutArgEventHandler<EM1[K]>,
      opts?: BFChainUtil.EventOptions
    ): unknown;
    once<K extends keyof EM2>(
      eventname: K,
      handler: MutArgEventHandler<EM2[K]>,
      opts?: BFChainUtil.EventOptions
    ): unknown;
    off<K extends keyof EM1>(
      eventname: K,
      handler?: MutArgEventHandler<EM1[K]>
    ): unknown;
    off<K extends keyof EM2>(
      eventname: K,
      handler?: MutArgEventHandler<EM2[K]>
    ): unknown;
    emit<K extends keyof EM1>(eventname: K, ...data: MutArg<EM1[K]>): unknown;
    emit<K extends keyof EM2>(eventname: K, ...data: MutArg<EM2[K]>): unknown;
    TYPE: EM1 | EM2;
  };
  //#endregion

  interface EventMap {
    [key: string]: UnknownMutArg;
  }
  // type EventMap = { [key: string]: MutArg };

  type OnceEventOptions = Omit<EventOptions, "once">;
  type EventHanldersMap<EM> = {
    [key in keyof EM]?: Map<MutArgEventHandler<EM[key]>, EventOptions>;
  };
  type _EM_To_Object<EM> = {
    [K in keyof EM]: {
      eventname: K;
      args: EM[K];
    };
  };
  type _EMObjectList<EM> = _EM_To_Object<EM>[keyof _EM_To_Object<EM>];
  //#region catch error events
  type InnerErrorHanlderArg<
    EM,
    EMOL extends _EMObjectList<EM> = _EMObjectList<EM>
  > = [unknown, EMOL];
  type InnerErrorHandler<EM> = MutArgEventHandler<InnerErrorHanlderArg<EM>>;
  //#endregion
  //#region watch any events
  type InnerAnyHandlerArg<EM> = [_EMObjectList<EM>];
  type InnerAnyHandler<EM> = MutArgEventHandler<InnerAnyHandlerArg<EM>>;
  //#endregion
}
