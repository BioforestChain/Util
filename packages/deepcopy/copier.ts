import { getFromCopyMap } from "./copy_map.ts";
import { detectType } from "./detector.ts";

/**
 * no operation
 */
function noop() {}

/**
 * copy value
 *
 * @param {*} value
 * @param {string} [type=null]
 * @param {Function} [customizer=noop]
 * @return {*}
 */
export function copy<V>(value: V, valueType = detectType(value), customizer: Function = noop): V {
  const copyFunction = getFromCopyMap<V>(valueType);

  if (valueType === "Object") {
    const result = customizer(value, valueType);

    if (result !== undefined) {
      return result;
    }
  }

  // NOTE: TypedArray needs pass type to argument
  return copyFunction ? copyFunction(value, valueType) : value;
}
