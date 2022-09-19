const UTF8_DECODE_CACHE = new WeakMap<Uint8Array, string>();
import TextCoder from "!encoding-utf8/text";
const { TextEncoder, TextDecoder } = TextCoder();

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
/**读取ArrayBuffer成hex字符串 */
export function decodeBinaryToUTF8(binary: Uint8Array) {
  if (!binary || !binary.length) {
    return "";
  }
  let res = UTF8_DECODE_CACHE.get(binary);
  if (typeof res === "string") {
    return res;
  }
  res = decoder.decode(binary);
  if (res) {
    UTF8_DECODE_CACHE.set(binary, res);
  }
  return res;
}
const emptyUint8Array = new Uint8Array();
/**将hex字符串写成额ArrayBuffer */
export function encodeUTF8ToBinary(value?: string) {
  if (!value) {
    return emptyUint8Array;
  }
  const buffer =
    value.length <= 128
      ? fasterSmallUTF8ToBinary(value)
      : encoder.encode(value);
  UTF8_DECODE_CACHE.set(buffer, value);
  return buffer;
}

function fasterSmallUTF8ToBinary(string: string) {
  const res = [];
  let c1: number;
  let c2: number;
  for (let i = 0; i < string.length; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      res[res.length] = c1;
    } else if (c1 < 2048) {
      res[res.length] = (c1 >> 6) | 192;
      res[res.length] = (c1 & 63) | 128;
    } else if (
      (c1 & 0xfc00) === 0xd800 &&
      ((c2 = string.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
    ) {
      c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
      ++i;
      res[res.length] = (c1 >> 18) | 240;
      res[res.length] = ((c1 >> 12) & 63) | 128;
      res[res.length] = ((c1 >> 6) & 63) | 128;
      res[res.length] = (c1 & 63) | 128;
    } else {
      res[res.length] = (c1 >> 12) | 224;
      res[res.length] = ((c1 >> 6) & 63) | 128;
      res[res.length] = (c1 & 63) | 128;
    }
  }
  return new Uint8Array(res);
}
