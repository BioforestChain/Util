import { isFlagInDev } from "@bfchain/util-env";
import { isNodejs, isWebView } from "@bfchain/util-platform";
import type { DebugCreater } from "./common";
import BrowserDebugCreaterFactory from "./debug-creator.browser";
import NodejsDebugCreaterFactory from "./debug-creator.node";

let DebugCreaterFactory: typeof NodejsDebugCreaterFactory | typeof BrowserDebugCreaterFactory;
if (isWebView) {
  if (isNodejs && isFlagInDev("node-logger")) {
    DebugCreaterFactory = NodejsDebugCreaterFactory;
  } else {
    DebugCreaterFactory = BrowserDebugCreaterFactory;
  }
} else if (isNodejs) {
  DebugCreaterFactory = NodejsDebugCreaterFactory;
} else {
  DebugCreaterFactory = BrowserDebugCreaterFactory;
}
export default DebugCreaterFactory as () => DebugCreater<any>;
