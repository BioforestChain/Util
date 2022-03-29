import { isNodejs } from "@bfchain/util-platform";
import PerfInNode from "./performance.node";
import PerfInBrowser from "./performance.browser";
let Perf: typeof PerfInNode | typeof PerfInBrowser;
if (isNodejs) {
  Perf = PerfInNode;
} else {
  Perf = PerfInBrowser;
}
export default Perf;
