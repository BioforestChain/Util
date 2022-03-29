import { Injectable } from "./Injectable";
import { InjectionToken, getInjectionGroups } from "./common";
import { EasyMap } from "@bfchain/util-extends-map";

export const MODULE_MAP = Symbol("module-map");

/**有几层面具 */
const _MASK_LEVEL_SYMBOL_ = Symbol("mask-level");
/**面具下的实际对象 */
const _MASK_SELF_SYMBOL_ = Symbol("mask-self");

@Injectable(MODULE_MAP)
export class ModuleStroge implements Map<BFChainUtil.MODULE_ID_TYPE, any> {
  clear(): void {
    return this._stroge.clear();
  }
  delete(key: string | number | symbol): boolean {
    return this._stroge.delete(key);
  }
  forEach(
    callbackfn: (
      value: any,
      key: string | number | symbol,
      map: Map<string | number | symbol, any>,
    ) => void,
    thisArg?: any,
  ): void {
    return this._stroge.forEach(callbackfn, thisArg);
  }
  set(key: string | number | symbol, value: any): this {
    this._stroge.set(key, value);
    return this;
  }
  get size() {
    return this._stroge.size;
  }
  /**
   * @TODO 应该也提供对parent、mask的迭代、size计算等功能
   */
  [Symbol.iterator](): IterableIterator<[string | number | symbol, any]> {
    return this._stroge[Symbol.iterator]();
  }
  entries(): IterableIterator<[string | number | symbol, any]> {
    return this._stroge.entries();
  }
  keys(): IterableIterator<string | number | symbol> {
    return this._stroge.keys();
  }
  values(): IterableIterator<any> {
    return this._stroge.values();
  }
  [Symbol.toStringTag] = "ModuleStroge";
  private _stroge: Map<BFChainUtil.MODULE_ID_TYPE, any>;
  constructor(
    entries?: ReadonlyArray<[BFChainUtil.MODULE_ID_TYPE, any]> | null,
    private parent?: ModuleStroge,
  ) {
    this._stroge = new Map(entries);
    this.set(MODULE_MAP, this);
  }

  get<T = any>(key: BFChainUtil.MODULE_ID_TYPE): T {
    /**
     * 原型链方式的查询自己与父级
     */
    return !this.parent || this._stroge.has(key) ? this._stroge.get(key) : this.parent.get(key);
  }
  has(key: BFChainUtil.MODULE_ID_TYPE): boolean {
    /**
     * 原型链方式的查询自己与父级
     */
    if (this._stroge.has(key)) {
      return true;
    }
    if (this.parent) {
      return this.parent.has(key);
    }
    return false;
  }

  /**面具的层数 */
  readonly [_MASK_LEVEL_SYMBOL_] = 0;
  /**指向真实的自己 */
  readonly [_MASK_SELF_SYMBOL_] = this;

  /**
   * 带上面具
   * 创建原型链
   * 使用Proxy，避过原型链的拦截，确保`_groupCollection`等可空的属性能够正确作用到`this`的属性上
   * @param mask
   */
  installMask(mask: ModuleStroge): ModuleStroge {
    const maskGet = (key: BFChainUtil.MODULE_ID_TYPE) => {
      /**如果是要获取自身，那么返回proxy对象 */
      if (key === MODULE_MAP) {
        const moduleMap = mask.get(key);
        if (moduleMap === mask) {
          return proxyMask;
        }
      }
      /**
       * 优先从面具集群中寻找
       */
      if (mask.has(key)) {
        return mask.get(key);
      }
      return this.get(key);
    };
    const maskHas = (key: BFChainUtil.MODULE_ID_TYPE) => {
      /**
       * 优先从面具集群中寻找
       */
      return mask.has(key) || this.has(key);
    };
    const proxyMask = new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop === "_mask") {
          return mask;
        }
        if (prop === _MASK_LEVEL_SYMBOL_) {
          return this[_MASK_LEVEL_SYMBOL_] + 1;
        }
        if (prop === _MASK_SELF_SYMBOL_) {
          return this; // 这里的this，随着面具层的叠加，会发生改变，变成指向Proxy
        }
        if (prop === "get") {
          return maskGet;
        }
        if (prop === "has") {
          return maskHas;
        }
        return Reflect.get(target, prop, receiver);
      },
    });
    return proxyMask;
  }
  /**
   * 卸下面具
   */
  uninstallMask(deep = 1) {
    deep = Math.min(this[_MASK_LEVEL_SYMBOL_], deep);
    let res = this;
    for (let i = 0; i < deep; i += 1) {
      res = this[_MASK_SELF_SYMBOL_];
    }
    return res;
  }
  /**
   * 组收集器
   */
  private _groupCollection?: EasyMap<BFChainUtil.MODULE_ID_TYPE, Set<any>>;

  /**
   * 添加一个组实例
   * @param groupName
   * @param instance
   */
  groupInsert(groupName: BFChainUtil.MODULE_ID_TYPE, instance: unknown) {
    const pluginCollection =
      this._groupCollection || (this._groupCollection = new EasyMap(name => new Set()));
    const plugins = pluginCollection.forceGet(groupName);
    plugins.add(instance);
  }
  /**
   * 获取模块注入的组
   * @param CtorRoot
   */
  groupGet<T = unknown>(
    ...CtorRootList: Array<
      | InjectionToken<T>
      | BFChainUtil.Constructor<T>
      | BFChainUtil.MODULE_ID_TYPE
      | BFChainUtil.MODULE_ID_TYPE[]
    >
  ) {
    let result: Set<T> | undefined;
    for (const CtorRoot of CtorRootList) {
      let groups: BFChainUtil.MODULE_ID_TYPE[] | undefined;
      switch (typeof CtorRoot) {
        case "function":
          groups = [...getInjectionGroups(CtorRoot)];
          break;
        case "object":
          groups = CtorRoot;
          break;
        default:
          groups = [CtorRoot];
      }

      if (!(groups instanceof Array)) {
        throw new TypeError();
      }

      /// 从自身上找
      const _result = this.groupsGet_<T>(groups);

      if (_result) {
        if (result) {
          for (const ins of _result) {
            result.add(ins);
          }
        } else {
          result = _result;
        }
      }

      if (this.parent) {
        /// 从原型链上找
        const parentResult = this.parent.groupsGet_<T>(groups);
        if (parentResult) {
          if (result) {
            for (const ins of parentResult) {
              result.add(ins);
            }
          } else {
            result = parentResult;
          }
        }
      }
    }
    return result || new Set();
  }
  /**
   * 递归获取出组模块集合
   * @param groups
   */
  private groupsGet_<T>(groups: BFChainUtil.MODULE_ID_TYPE[]) {
    groups = groups.slice();
    let result: Set<T> | undefined;

    /**
     * 过滤器，因为要区交集，所以一开始默认收集全部
     * @param ins
     */
    let filter = (ins: T) => true;
    do {
      const groupName = groups.shift();
      if (groupName === undefined) {
        break;
      }
      result = new Set();
      for (const ins of this.groupGet_<T>(groupName)) {
        if (filter(ins)) {
          result.add(ins);
        }
      }
      /// 重写过滤器
      if (result.size) {
        const inSet = result;
        filter = (ins: T) => inSet.has(ins);
      } else {
        break;
      }
    } while (true);
    return result;
  }
  /**
   * 递归获取出组模块集合
   * @param groupName
   */
  private groupGet_<T>(groupName: BFChainUtil.MODULE_ID_TYPE) {
    const result: T[] = [];
    if (this._groupCollection) {
      const plugins = this._groupCollection.get(groupName);
      if (plugins) {
        result.push(...plugins);
      }
    }
    if (this.parent) {
      result.push(...this.parent.groupGet_<T>(groupName));
    }
    return result;
  }
}
