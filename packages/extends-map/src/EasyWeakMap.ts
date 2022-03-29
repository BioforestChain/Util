export class EasyWeakMap<K extends object, V, F extends object = K> extends WeakMap<F, V> {
  constructor(
    public creater: (key: K, formatedKey: F) => V,
    entries?: ReadonlyArray<[F, V]> | null,
    public transformKey: (key: K) => F = (v) => (v as unknown) as F,
    private readonly _afterDelete?: (key: F) => unknown,
  ) {
    super(entries);
  }

  static from<K extends object, V, F extends object = K>(args: {
    creater: (key: K, formatedKey: F) => V;
    entries?: ReadonlyArray<[F, V]> | null;
    transformKey?: (key: K) => F;
    afterDelete?: (key: F) => unknown;
  }) {
    return new EasyWeakMap(args.creater, args.entries, args.transformKey, args.afterDelete);
  }
  forceGet(key: K, creater = this.creater) {
    const k = this.transformKey(key);
    if (this.has(k)) {
      return this.get(k) as V;
    }
    const res = creater(key, k);
    this.set(k, res);
    return res;
  }
  tryGet(key: K) {
    return this.get(this.transformKey(key));
  }
  trySet(key: K, val: V) {
    return this.set(this.transformKey(key), val);
  }
  tryDelete(key: K) {
    return this.delete(this.transformKey(key));
  }
  tryHas(key: K) {
    return this.has(this.transformKey(key));
  }

  delete(key: F) {
    const res = super.delete(key);
    if (res && this._afterDelete) {
      this._afterDelete(key);
    }
    return res;
  }

  get [Symbol.toStringTag]() {
    return "EasyWeakMap";
  }
  static call(_this: any, creater: any, entries: any, transformKey: any, _afterDelete: any) {
    if (!(_this instanceof EasyWeakMap)) {
      throw new TypeError("please use new keyword to create EasyWeakMap instance.");
    }
    const protoMap = new EasyWeakMap(creater, entries, transformKey, _afterDelete);
    const protoMap_PROTO = Object.getPrototypeOf(protoMap);
    const protoMap_PROTO_PROTO = Object.getPrototypeOf(protoMap_PROTO);

    const mapProps = Object.getOwnPropertyDescriptors(protoMap_PROTO_PROTO);
    for (const key in mapProps) {
      if (key !== "constructor") {
        const propDes = mapProps[key];
        if (typeof propDes.value === "function") {
          propDes.value = propDes.value.bind(protoMap);
        } else {
          if (typeof propDes.get === "function") {
            propDes.get = propDes.get.bind(protoMap);
          }
          if (typeof propDes.set === "function") {
            propDes.set = propDes.set.bind(protoMap);
          }
        }
        Object.defineProperty(_this, key, propDes);
      }
    }

    const easymapProps = Object.getOwnPropertyDescriptors(protoMap_PROTO);
    for (const key in easymapProps) {
      if (key !== "constructor") {
        const propDes = easymapProps[key];
        if (typeof propDes.value === "function") {
          propDes.value = propDes.value.bind(protoMap);
        } else {
          if (typeof propDes.get === "function") {
            propDes.get = propDes.get.bind(protoMap);
          }
          if (typeof propDes.set === "function") {
            propDes.set = propDes.set.bind(protoMap);
          }
        }
        Object.defineProperty(_this, key, propDes);
      }
    }

    const thisProps = Object.getOwnPropertyDescriptors(protoMap);
    for (const key in thisProps) {
      if (key !== "constructor")
        Object.defineProperty(_this, key, {
          enumerable: true,
          configurable: true,
          get() {
            return Reflect.get(protoMap, key);
          },
          set(v) {
            Reflect.set(protoMap, key, v);
          },
        });
    }

    return _this;
  }
}
