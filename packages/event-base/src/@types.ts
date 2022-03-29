declare namespace BFChainUtil {
  type EventOptions = {
    taskname?: string;
    once?: boolean;
    // context?: unknown;
  };

  type MutArgEventHandler<A> = (...data: MutArg<A>) => unknown;
  type UnknownMutArg = unknown[];
  type MutArg<A> = A extends UnknownMutArg ? A : never;

  /**
   * 获取事件模型的事件类型定义
   * 基于`BaseEventEmitter`的一个纯类型定义属性来导出类型的定义
   */
  type EmitterEvents<EE> = EE extends { TYPE: infer U } ? U : never;
}
