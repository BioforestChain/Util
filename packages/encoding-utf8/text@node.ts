import {
  TextEncoder,
  TextDecoder,
} from "https://deno.land/std@0.156.0/node/util.ts";
import { $global } from "../typings/global.ts";
if ("TextEncoder" in $global === false) {
  Reflect.set($global, "TextEncoder", TextEncoder);
  Reflect.set($global, "TextDecoder", TextDecoder);
}
export default () => ({ TextDecoder, TextEncoder });
