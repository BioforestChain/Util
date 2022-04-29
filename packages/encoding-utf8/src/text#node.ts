import { TextEncoder, TextDecoder } from "util";
if ("TextEncoder" in global) {
  (global as any).TextEncoder = TextEncoder;
  (global as any).TextDecoder = TextDecoder;
}
export default () => ({ TextDecoder, TextEncoder });
