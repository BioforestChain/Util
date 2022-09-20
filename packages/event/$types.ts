import { $EventOptions, $MutArgEventHandler } from "../event-base/$types.ts";
import {
  $EventInOutMap,
  $InnerAnyInOutHandlerArg,
  $InOutEventHandler,
  $InOutSyncEventHandler,
} from "../event-quene_emitter/$types.ts";
import { $PromiseOut } from "../extends-promise-out/$types.ts";
import { QueneEventEmitter } from "./index.ts";

/**
 * 将import写法改为BFChainUtil.PromiseOut，因为有引入../extends-promise-out包
 * ../extends-promise-out的@types.type.d.ts包含PromiseOut，统一写法
 */
export type $EventWaitterMap<EM> = {
  [key in keyof EM]?: $PromiseOut<EM[key]>;
};
// type EventWaitterMap<EM> = {
//   [key in keyof EM]?: import("../extends-promise-out/index.ts").PromiseOut<
//     EM[key]
//   >;
// };

//#endregion

//#region events

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
  TYPE: EM;
}
export interface $QueneEventEmitterPro<EM extends $EventInOutMap = {}>
  extends QueneEventEmitter<EM> {
  onEmit(
    commonHanlder: $MutArgEventHandler<$InnerAnyInOutHandlerArg<EM>>,
    opts?: $EventOptions
  ): void;
  offEmit(
    commonHanlder: $MutArgEventHandler<$InnerAnyInOutHandlerArg<EM>>
  ): boolean;
}

export interface $SyncQueneEventEmitter<EM extends $EventInOutMap = {}>
  extends QueneEventEmitter<EM> {
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
export interface SyncQueneEventEmitterPro<EM extends $EventInOutMap = {}>
  extends $QueneEventEmitterPro<EM> {
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
