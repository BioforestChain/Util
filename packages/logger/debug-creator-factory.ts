import type { DebugCreater } from "./common.ts";
import DebugCreaterFactory from "!logger/debug-creator";

export default DebugCreaterFactory as () => DebugCreater<any>;
