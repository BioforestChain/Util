import { Injectable } from "../dep_inject/index.ts";
import {
  platformInfo,
  isNodejs,
  isWin32,
  isCordova,
  isWebView,
  isWebMainThread,
  isWebWorker,
} from "../platform/index.ts";
import { cacheGetter } from "../decorator/index.ts";
import Perf from "./performance.ts";

@Injectable()
export class PlatformHelper {
  platformInfo = platformInfo;
  @cacheGetter
  get platformName() {
    return platformInfo.platformName();
  }
  @cacheGetter
  get isNodejs() {
    return isNodejs;
  }
  @cacheGetter
  get isWin32() {
    return isWin32;
  }
  @cacheGetter
  get isCordova() {
    return isCordova;
  }
  @cacheGetter
  get isWebView() {
    return isWebView;
  }
  @cacheGetter
  get isWebMainThread() {
    return isWebMainThread;
  }
  @cacheGetter
  get isWebWorker() {
    return isWebWorker;
  }
  performance = Perf();
}
