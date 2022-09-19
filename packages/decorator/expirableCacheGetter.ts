/**
 * 带过期功能的缓存器
 * - 时间模式下
 *   - 如果是频繁获取的行为， 可以使用timer
 *   > 会创建setTimeout定时器，会多消耗内存来缓存定时器函数
 *   - 如果是低频率获取的行为，可以使用checker
 *   > 单纯使用缓存的时间来判定，会多消耗判定的CPU
 *
 * @param expirationCondition
 */
export function expirableCacheGetter(
  expirationCondition: { timeout: number; mode?: "timer" | "checker" } | (() => boolean),
) {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    if (typeof descriptor.get !== "function") {
      throw new TypeError(`property ${String(key)} must has an getter function.`);
    }
    let source_fun = descriptor.get;
    const CACHE_VALUE_SYMBOL = Symbol(`${key.toString()}[[cache]]`);

    let expirableChecker: () => boolean;
    if (typeof expirationCondition === "object") {
      const { mode = "timer", timeout } = expirationCondition;
      if (mode === "checker") {
        let cacheTime = 0;
        expirableChecker = () => {
          return Date.now() - cacheTime > timeout;
        };
        const sou_source_fun = source_fun;
        source_fun = function (this: typeof target) {
          try {
            return sou_source_fun.apply(this, arguments as any);
          } finally {
            cacheTime = Date.now();
          }
        };
      } else {
        expirableChecker = () => true;
        const sou_source_fun = source_fun;
        source_fun = function (this: typeof target) {
          try {
            return sou_source_fun.apply(this, arguments as any);
          } finally {
            setTimeout(() => {
              delete this[CACHE_VALUE_SYMBOL];
            }, timeout);
          }
        };
      }
    } else {
      expirableChecker = expirationCondition;
    }
    descriptor.get = function (this: any, ...args) {
      if (CACHE_VALUE_SYMBOL in this && expirableChecker()) {
        return this[CACHE_VALUE_SYMBOL];
      } else {
        return (this[CACHE_VALUE_SYMBOL] = source_fun.apply(this, args));
      }
    };
    (descriptor.get as any).source_fun = source_fun;
    return descriptor;
  };
}
