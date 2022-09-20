import { $Buffer } from "../buffer/$types.ts";
import { $global } from "../typings/global.ts";
import { copy as cloneBuffer } from "./buffer.ts";

/**
 * copy ArrayBuffer
 *
 * @param {ArrayBuffer} value
 * @return {ArrayBuffer}
 */
function copyArrayBuffer<R extends ArrayBuffer>(value: R): R {
  return value.slice(0) as R;
}

/**
 * copy Boolean
 *
 * @param {Boolean} value
 * @return {Boolean}
 */
function copyBoolean<R extends boolean>(value: R): R {
  return !!value.valueOf() as R;
}

/**
 * copy DataView
 *
 * @param {DataView} value
 * @return {DataView}
 */
function copyDataView<R extends DataView>(value: R): R {
  // TODO: copy ArrayBuffer?
  return new DataView(value.buffer) as R;
}

/**
 * copy Buffer
 *
 * @param {Buffer} value
 * @return {Buffer}
 */
function copyBuffer<R extends $Buffer>(value: $Buffer): R {
  return cloneBuffer(value) as unknown as R;
}

/**
 * copy Date
 *
 * @param {Date} value
 * @return {Date}
 */
function copyDate<R extends Date>(value: R): R {
  return new Date(value.getTime()) as R;
}

/**
 * copy Number
 *
 * @param {Number} value
 * @return {Number}
 */
function copyNumber<R extends number>(value: R): R {
  return +value as R;
}

/**
 * copy RegExp
 *
 * @param {RegExp} value
 * @return {RegExp}
 */
function copyRegExp<R extends RegExp>(value: R): R {
  return new RegExp(value.source || "(?:)", value.flags) as R;
}

/**
 * copy String
 *
 * @param {String} value
 * @return {String}
 */
function copyString<R extends string>(value: R): R {
  return ("" + value) as R;
}

/**
 * copy TypedArray
 *
 * @param {*} value
 * @return {*}
 */
function copyTypedArray<R>(value: R, type: string): R {
  return $global[type].from(value) as R;
}

/**
 * shallow copy
 *
 * @param {*} value
 * @return {*}
 */
function shallowCopy<R>(value: R): R {
  return value as R;
}

/**
 * get empty Array
 *
 * @return {Array}
 */
function getEmptyArray<R extends []>(): R {
  return [] as R;
}

/**
 * get empty Map
 *
 * @return {Map}
 */
function getEmptyMap<R extends Map<any, any>>(): R {
  return new Map() as R;
}

/**
 * get empty Object
 *
 * @return {Object}
 */
function getEmptyObject<R extends {}>(): R {
  return {} as R;
}

/**
 * get empty Set
 *
 * @return {Set}
 */
function getEmptySet<R extends Set<any>>(): R {
  return new Set() as R;
}

const copyMap = new Map<string, <R extends never>(value: R, type: string) => R>(
  [
    // deep copy
    ["ArrayBuffer", copyArrayBuffer],
    ["Boolean", copyBoolean],
    ["Buffer", copyBuffer],
    ["DataView", copyDataView],
    ["Date", copyDate],
    ["Number", copyNumber],
    ["RegExp", copyRegExp],
    ["String", copyString],

    // typed arrays
    // TODO: pass bound function
    ["Float32Array", copyTypedArray],
    ["Float64Array", copyTypedArray],
    ["Int16Array", copyTypedArray],
    ["Int32Array", copyTypedArray],
    ["Int8Array", copyTypedArray],
    ["Uint16Array", copyTypedArray],
    ["Uint32Array", copyTypedArray],
    ["Uint8Array", copyTypedArray],
    ["Uint8ClampedArray", copyTypedArray],

    // shallow copy
    ["Array Iterator", shallowCopy],
    ["Map Iterator", shallowCopy],
    ["Promise", shallowCopy],
    ["Set Iterator", shallowCopy],
    ["String Iterator", shallowCopy],
    ["function", shallowCopy],
    ["global", shallowCopy],
    // NOTE: WeakMap and WeakSet cannot get entries
    ["WeakMap", shallowCopy],
    ["WeakSet", shallowCopy],

    // primitives
    ["boolean", shallowCopy],
    ["null", shallowCopy],
    ["number", shallowCopy],
    ["string", shallowCopy],
    ["symbol", shallowCopy],
    ["undefined", shallowCopy],

    // collections
    // NOTE: return empty value, because recursively copy later.
    ["Arguments", getEmptyArray],
    ["Array", getEmptyArray],
    ["Map", getEmptyMap],
    ["Object", getEmptyObject],
    ["Set", getEmptySet],

    // NOTE: type-detect returns following types
    // 'Location'
    // 'Document'
    // 'MimeTypeArray'
    // 'PluginArray'
    // 'HTMLQuoteElement'
    // 'HTMLTableDataCellElement'
    // 'HTMLTableHeaderCellElement'

    // TODO: is type-detect never return 'object'?
    // 'object'
  ]
);

export function getFromCopyMap<R>(type: string) {
  return copyMap.get(type) as ((value?: R, type?: string) => R) | undefined;
}
