import { Injectable } from "@bfchain/util-dep-inject";
import {
  platformInfo,
  isNodejs,
  isWindows,
  isCordova,
  isWebView,
  isWebMainThread,
  isWebWorker,
} from "@bfchain/util-platform";
import { cacheGetter } from "@bfchain/util-decorator";
import Perf from "./performance";

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
  get isWindows() {
    return isWindows;
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
