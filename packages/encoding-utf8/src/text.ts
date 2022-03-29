import { isNodejs } from "@bfchain/util-platform";
import TextInNode from "./text.node";
import TextInBrowser from "./text.browser";
let TextCoder: typeof TextInNode | typeof TextInBrowser;
if (isNodejs) {
  TextCoder = TextInNode;
} else {
  TextCoder = TextInBrowser;
}
export default TextCoder;
