import { typeDetect } from "@bfchain/util-type-detect";

import { isBuffer } from "./buffer";

/**
 * detect type of value
 *
 * @param {*} value
 * @return {string}
 */
export function detectType(value: any) {
  // NOTE: isBuffer must execute before type-detect,
  // because type-detect returns 'Uint8Array'.
  if (isBuffer(value)) {
    return "Buffer";
  }

  return typeDetect(value);
}
