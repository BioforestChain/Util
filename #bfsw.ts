import { defineWorkspace } from "@bfchain/pkgm-bfsw";
import typings from "./packages/typings/#bfsp";
import aborter from "./packages/aborter/#bfsp";
import binaryTreeMap from "./packages/binary-tree-map/#bfsp";
import buffer from "./packages/buffer/#bfsp";
import decorator from "./packages/decorator/#bfsp";
import deepcopy from "./packages/deepcopy/#bfsp";
import deepmix from "./packages/deepmix/#bfsp";
import depInject from "./packages/dep_inject/#bfsp";
import encodingBinary from "./packages/encoding-binary/#bfsp";
import encodingHex from "./packages/encoding-hex/#bfsp";
import encodingUtf8 from "./packages/encoding-utf8/#bfsp";
import env from "./packages/env/#bfsp";
import event from "./packages/event/#bfsp";
import eventBase from "./packages/event-base/#bfsp";
import eventMapEmitter from "./packages/event-map_emitter/#bfsp";
import eventQueneEmitter from "./packages/event-quene_emitter/#bfsp";
import exception from "./packages/exception/#bfsp";
import exceptionErrorCode from "./packages/exception-error-code/#bfsp";
import exceptionGenerator from "./packages/exception-generator/#bfsp";
import exceptionLogger from "./packages/exception-logger/#bfsp";
import extendsArray from "./packages/extends-array/#bfsp";
import extendsAsyncIterator from "./packages/extends-async_iterator/#bfsp";
import extendsError from "./packages/extends-error/#bfsp";
import extendsFunction from "./packages/extends-function/#bfsp";
import extendsIterator from "./packages/extends-iterator/#bfsp";
import extendsIteratorIs from "./packages/extends-iterator-is/#bfsp";
import extendsMap from "./packages/extends-map/#bfsp";
import extendsObject from "./packages/extends-object/#bfsp";
import extendsPromise from "./packages/extends-promise/#bfsp";
import extendsPromiseIs from "./packages/extends-promise-is/#bfsp";
import extendsPromiseOut from "./packages/extends-promise-out/#bfsp";
import extendsPromiseSafe from "./packages/extends-promise-safe/#bfsp";
import extendsSet from "./packages/extends-set/#bfsp";
import fastDeepEqual from "./packages/fast_deep_equal/#bfsp";
import i18n from "./packages/i18n/#bfsp";
import lockAtom from "./packages/lock-atom/#bfsp";
import logger from "./packages/logger/#bfsp";
import ms from "./packages/ms/#bfsp";
import platform from "./packages/platform/#bfsp";
import reactiveArray from "./packages/reactive-array/#bfsp";
import reactiveStream from "./packages/reactive-stream/#bfsp";
import typeDetect from "./packages/type_detect/#bfsp";
import util from "./packages/util/#bfsp";
export default defineWorkspace(() => {
  const config: Bfsw.Workspace = {
    projects: [
      // typings,
      // // -------------------------------------------
      // buffer,
      // deepmix,
      // encodingBinary,
      // encodingHex,
      // extendsArray,
      // extendsError,
      // extendsFunction,
      // extendsIteratorIs,
      // extendsObject,
      // extendsPromiseIs,
      // lockAtom,
      // ms,
      // typeDetect,
      // // -------------------------------------------
      // exceptionErrorCode,
      // extendsIterator,
      // extendsPromiseOut,
      // // -------------------------------------------
      // extendsPromiseSafe,
      // aborter,
      // deepcopy,
      // exceptionGenerator,
      // fastDeepEqual,
      // platform,
      // reactiveArray,
      // // encodingUtf8,
      // env,
      // decorator,
      // // -------------------------------------------
      // binaryTreeMap,
      // extendsMap,
      // extendsSet,
      // depInject,
      // eventBase,
      // i18n,
      // eventMapEmitter,
      // eventQueneEmitter,
      // event,
      // extendsPromise,
      // logger,
      // exceptionLogger,
      // exception,
      // reactiveStream,
      // extendsAsyncIterator,
      // // -------------------------------------------
      // util,

      extendsMap,
      eventBase,
      logger,
      exceptionLogger,
      typings,
      extendsError,
      extendsFunction,
      extendsObject,
      ms,
      platform,
      env,
      decorator,
      binaryTreeMap,
      extendsSet,
      depInject,
      i18n,
      eventMapEmitter,
      eventQueneEmitter,
      event,
      extendsPromise,
      exception,
      reactiveStream,
      extendsAsyncIterator,
      util,
      exceptionErrorCode,
      extendsIterator,
      extendsPromiseOut,
      buffer,
      deepmix,
      encodingBinary,
      encodingHex,
      extendsArray,
      extendsIteratorIs,
      extendsPromiseIs,
      lockAtom,
      typeDetect,
      extendsPromiseSafe,
      aborter,
      deepcopy,
      exceptionGenerator,
      fastDeepEqual,
      reactiveArray,
      encodingUtf8,
    ],
  };
  return config;
});
