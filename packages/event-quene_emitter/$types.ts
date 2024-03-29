import { $EventOptions, $MutArgEventHandler } from "../event-base/$types.ts";

export interface $QueneEventEmitter<EM extends $EventInOutMap = {}> {
  on<K extends keyof EM>(
    eventname: K,
    handler: $InOutEventHandler<EM[K]>,
    opts?: $EventOptions
  ): unknown;
  once<K extends keyof EM>(
    eventname: K,
    handler: $InOutEventHandler<EM[K]>,
    opts?: Omit<$EventOptions, "once">
  ): unknown;
  has<K extends keyof EM>(
    eventname: K,
    handler?: $InOutEventHandler<EM[K]>
  ): boolean;
  off<K extends keyof EM>(
    eventname: K,
    handler: $InOutEventHandler<EM[K]>
  ): boolean;
  emit<K extends keyof EM>(
    eventname: K,
    data: EM[K]["in"]
  ): EM[K]["out"] | Promise<EM[K]["out"]> | undefined;
  emitToAsyncGenerator<K extends keyof EM>(
    eventname: K,
    data: EM[K]["in"]
  ): AsyncGenerator<unknown, void | EM[K]["out"], unknown>;
  TYPE: EM;
}
export interface $SyncQueneEventEmitter<EM extends $EventInOutMap = {}>
  extends $QueneEventEmitter<EM> {
  on<K extends keyof EM>(
    eventname: K,
    handler: $InOutSyncEventHandler<EM[K]>,
    opts?: $EventOptions
  ): void;
  has<K extends keyof EM>(
    eventname: K,
    handler?: $InOutSyncEventHandler<EM[K]>
  ): boolean;
  off<K extends keyof EM>(
    eventname: K,
    handler: $InOutSyncEventHandler<EM[K]>
  ): boolean;
  emit<K extends keyof EM>(
    eventname: K,
    data: EM[K]["in"]
  ): EM[K]["out"] | undefined;
}
//#endregion

export type $EventInOut<I = unknown, O = void> = { in: I; out: O };
export type $UnknownEventInOut = $EventInOut<unknown, unknown>;
export type $EventHandler<A = unknown, R = void> = (
  data: A,
  next: () => R | Promise<R>
) => R | Promise<R> | AsyncGenerator<unknown, R> | Generator<unknown, R>;
export type $SyncEventHandler<A = unknown, R = void> = (
  data: A,
  next: () => R
) => R;
export type $InOutSyncEventHandler<IO extends $UnknownEventInOut> =
  $SyncEventHandler<IO["in"], IO["out"]>;
export type $InOutEventHandler<IO extends $UnknownEventInOut> = $EventHandler<
  IO["in"],
  IO["out"]
>;
export type $EventInOutMap = {
  [key: string]: $UnknownEventInOut;
};
export type $EventInOutHanldersMap<EM extends $EventInOutMap> = {
  [key in keyof EM]?: Map<$InOutEventHandler<EM[key]>, $EventOptions>;
};

//#region catch error in out events
type $InnerErrorInOutHandlerArg<
  EM extends $EventInOutMap,
  K extends keyof EM = keyof EM
> = [
  unknown,
  {
    // hanlder: InOutEventHandler<EM[K]>;
    eventname: K;
    arg: EM[K]["in"];
  }
];
export type $InnerErrorInOutHandler<EM extends $EventInOutMap> =
  $MutArgEventHandler<$InnerErrorInOutHandlerArg<EM>>;

//#region watch any in out events

type _IOEM_To_Object<EM extends $EventInOutMap> = {
  [K in keyof EM]: {
    eventname: K;
    args: EM[K]["in"];
  };
};
export type $InnerAnyInOutHandlerArg<EM extends $EventInOutMap> = [
  _IOEM_To_Object<EM>[keyof _IOEM_To_Object<EM>]
];
export type $InnerAnyInOutHandler<EM extends $EventInOutMap> =
  $MutArgEventHandler<$InnerAnyInOutHandlerArg<EM>>;
//#endregion
