import type { DebugCreater } from "./common";
import DebugCreaterFactory from "#src/debug-creator";

export default DebugCreaterFactory as () => DebugCreater<any>;
