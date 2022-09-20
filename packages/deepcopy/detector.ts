import { typeDetect } from "../type_detect/index.ts";

import { isBuffer } from "./buffer.ts";

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
