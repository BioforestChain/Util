const freeGlobalThis =
  typeof globalThis !== "undefined" &&
  globalThis !== null &&
  globalThis.Object === Object &&
  globalThis;

const freeGlobal =
  typeof global !== "undefined" &&
  global !== null &&
  global.Object === Object &&
  global;

declare const global: typeof globalThis;

const freeSelf =
  typeof self !== "undefined" &&
  self !== null &&
  self.Object === Object &&
  self;

export const $global =
  freeGlobalThis || freeGlobal || freeSelf || Function("return this")();
if (Reflect.get($global, "globalThis") === undefined) {
  Reflect.set($global, "globalThis", $global);
}
