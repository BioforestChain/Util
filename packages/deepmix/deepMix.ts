import { mergeAble } from "./helper.ts";
type DeepMix<L extends unknown[]> = L extends [] ? {} : _DeepMix1<L>;
// L extends []
//   ? {}
//   : L extends [infer A1]
//   ? A1
//   : L extends [infer A1, infer A2]
//   ? A2 & A1
//   : {};

type _FUN<L extends unknown[]> = (...args: L) => void;
type _DeepMix1<L extends unknown[]> = _FUN<L> extends (a: infer A1) => void
  ? A1
  : _FUN<L> extends (a: infer A1, ...rest: infer A2) => void
  ? A1 & _DeepMix2<A2>
  : {};
type _DeepMix2<L extends unknown[]> = _FUN<L> extends (a: infer A1) => void
  ? A1
  : _FUN<L> extends (a: infer A1, ...rest: infer A2) => void
  ? A1 & _DeepMix3<A2>
  : {};
type _DeepMix3<L extends unknown[]> = _FUN<L> extends (a: infer A1) => void
  ? A1
  : _FUN<L> extends (a: infer A1, ...rest: infer A2) => void
  ? A1 & _DeepMix4<A2>
  : {};
type _DeepMix4<L extends unknown[]> = _FUN<L> extends (a: infer A1) => void
  ? A1
  : _FUN<L> extends (a: infer A1, ...rest: infer A2) => void
  ? A1 & _DeepMix5<A2>
  : {};
type _DeepMix5<L extends unknown[]> = _FUN<L> extends (a: infer A1) => void
  ? A1
  : _FUN<L> extends (a: infer A1, ...rest: infer A2) => void
  ? A1 & _DeepMix6<A2>
  : {};
type _DeepMix6<L extends unknown[]> = _FUN<L> extends (a: infer A1) => void
  ? A1
  : _FUN<L> extends (a: infer A1, b: infer A2) => void
  ? A1 & A2
  : any;

// type Z<L> = L extends (a:infer A, ...args:infer RS)=>unknown?A:L

function _safeDeepMix<L extends object[]>(objList: L): DeepMix<L> {
  if (objList.length === 1) {
    return objList[0] as DeepMix<L>;
  }
  return new Proxy(objList[0] as DeepMix<L>, {
    get(t, prop, r) {
      const matchedObjList = objList.filter((obj) => Reflect.has(obj, prop));
      if (matchedObjList.length === 0) {
        return undefined;
      }
      if (matchedObjList.length === 1) {
        return Reflect.get(matchedObjList[0], prop);
      }
      /// 如果有object，那么优先object
      const matchedValueList = matchedObjList.map((obj) => Reflect.get(obj, prop));
      const mergeableMatchedValueList = matchedValueList.filter((value) => mergeAble(value));
      /// 如果都是无法合并的值，那么直接返回最后一个就行了
      if (mergeableMatchedValueList.length === 0) {
        return matchedValueList[matchedValueList.length - 1];
      }
      /// 如果能够合并，那么进入合并模式
      return _safeDeepMix(mergeableMatchedValueList);
    },
    getOwnPropertyDescriptor(t, prop) {
      const matchedObjList = objList.filter((obj) => Reflect.has(obj, prop));
      if (matchedObjList.length === 0) {
        return undefined;
      }
      if (matchedObjList.length === 1) {
        return Object.getOwnPropertyDescriptor(matchedObjList[0], prop);
      }
      /// 如果有object，那么优先object
      const matchedObjValueList = matchedObjList.map((obj) => ({
        obj,
        value: Reflect.get(obj, prop),
      }));
      const mergeableMatchedObjValueList = matchedObjValueList.filter((ov) => mergeAble(ov.value));

      const latestPd = Object.getOwnPropertyDescriptor(
        matchedObjValueList[matchedObjValueList.length - 1].obj,
        prop,
      );
      /// 如果都是无法合并的值，那么直接返回最后一个就行了
      if (mergeableMatchedObjValueList.length === 0) {
        return latestPd;
      }
      /// 如果能够合并，那么进入合并模式
      return { ...latestPd, value: _safeDeepMix(matchedObjValueList.map((ov) => ov.value)) };
    },
    ownKeys() {
      const keys = new Set<ReturnType<typeof Reflect["ownKeys"]>[number]>();
      for (const obj of objList) {
        for (const key of Reflect.ownKeys(obj)) {
          keys.add(key);
        }
      }
      return [...keys];
    },
  });
}

export function deepMix<L extends unknown[]>(...unsafeObjList: L) {
  const objList = unsafeObjList.filter(mergeAble) as object[];
  if (objList.length === 0) {
    return {} as DeepMix<L>;
  }
  return _safeDeepMix(objList) as DeepMix<L>;
}

// const a2 = deepMix(
//   { a: 1, c: { a: 1, b: 2, arr: [1, 2, 3] } },
//   { b: 2, c: { b: 3, c: 4, arr: [4, 5] } },
// );
// console.log(Object.keys(a2));
// for (const k in a2) {
//   console.log("kv:", k, (a2 as never)[k]);
// }
// console.log(a2.b, a2.c.b);
// console.log(JSON.stringify(a2, null, 2));
