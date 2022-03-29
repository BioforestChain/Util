"use strict";

// do not edit .js files directly - edit src/index.jst

export function fastDeepEqual(a: any, b: any) {
  if (a === b) return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    try {
      if (a.constructor !== b.constructor) return false;

      let length: number;
      let i: number;
      let keys: string[];
      if (Array.isArray(a)) {
        length = a.length;
        if (length !== b.length) return false;
        for (i = length; i-- !== 0; ) if (!fastDeepEqual(a[i], b[i])) return false;
        return true;
      }

      if (a instanceof Map && b instanceof Map) {
        if (a.size !== b.size) return false;
        for (const key of a.keys()) if (!b.has(key)) return false;
        for (const item of a.entries()) if (!fastDeepEqual(item[1], b.get(item[0]))) return false;
        return true;
      }

      if (a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) return false;
        for (const item of a.values()) if (!b.has(item)) return false;
        return true;
      }

      if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
        length = a.byteLength;
        if (length !== b.byteLength) return false;

        let iaA: Uint8Array;
        let iaB: Uint8Array;
        if (a.constructor === b.constructor) {
          iaA = a as Uint8Array;
          iaB = b as Uint8Array;
        } else {
          // 如果构造函数不一样,那么就完全转化为最基础的Uint8Array来做对比
          if (a instanceof Int8Array || a instanceof Uint8Array) {
            iaA = a as Uint8Array;
            iaB = new (a.constructor as Uint8ArrayConstructor)(
              b.buffer,
              b.byteOffset,
              b.byteLength,
            );
          } else if (b instanceof Int8Array || b instanceof Uint8Array) {
            iaB = b as Uint8Array;
            iaA = new (b.constructor as Uint8ArrayConstructor)(
              a.buffer,
              a.byteOffset,
              a.byteLength,
            );
          } else {
            iaA = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
            iaB = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
          }
        }

        for (i = length; i-- !== 0; ) if (iaA[i] !== iaB[i]) return false;
        return true;
      }

      if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) return false;

      for (i = length; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

      for (i = length; i-- !== 0; ) {
        const key = keys[i];

        if (!fastDeepEqual(a[key], b[key])) return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}
