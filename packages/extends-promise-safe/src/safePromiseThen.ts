const SAFE_THENED_WM = new WeakMap<PromiseLike<any>, BFChainUtil.SafeThendCache<any>>();

/**
 * 不创建出一个新promise的then方法
 * 避免无止境的在一个不可能不resolve的的对象上持续地创建出新的promise导致内存问题
 * @param fromPromise
 * @param onfulfilled
 * @param onrejected
 */
export function safePromiseThen<T, TResult1 = T, TResult2 = never>(
  fromPromise: PromiseLike<T>,
  onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
  onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
) {
  let thened = SAFE_THENED_WM.get(fromPromise);
  if (!thened) {
    const cbs: BFChainUtil.SafeThendCache<T>["cbs"] = { resolves: new Set(), rejects: new Set() };

    const finish = () => {
      cbs.resolves.clear();
      cbs.rejects.clear();
      _thened.cbs = undefined;
    };
    const toPromise = fromPromise.then(
      (value) => {
        for (const resolveFun of cbs.resolves) {
          /// 使用queueMicrotask，确保后续finish能优先执行，清理列表。避免造成循环调用
          queueMicrotask(async () => {
            try {
              await resolveFun(value);
            } catch (err) {
              console.error(
                "Unhandled promise rejection when running onfulfilled",
                resolveFun,
                err,
              );
            }
          });
        }
        finish();
      },
      async (reason) => {
        for (const rejectFun of cbs.rejects) {
          queueMicrotask(async () => {
            try {
              await rejectFun(reason);
            } catch (err) {
              console.error("Unhandled promise rejection when running onrejected", rejectFun, err);
            }
          });
        }
        finish();
      },
    );
    const _thened: BFChainUtil.SafeThendCache<T> = {
      cbs,
      promise: toPromise,
      // isFinished: false,
    };
    SAFE_THENED_WM.set(fromPromise, (thened = _thened));
  }
  let toPromise: PromiseLike<unknown>;
  if (thened.cbs) {
    onfulfilled && thened.cbs.resolves.add(onfulfilled);
    onrejected && thened.cbs.rejects.add(onrejected);
    toPromise = thened.promise;
  } else {
    /// 如果 cbs 是空的，说明promise 的status已经不是pending的状态了，所以直接使用真是的then即可
    toPromise = fromPromise.then(onfulfilled, onrejected);
  }
  return { thened: thened as BFChainUtil.SafeThendCache<T>, toPromise };
}

export function safePromiseOffThen<T, TResult1 = T, TResult2 = never>(
  promise: PromiseLike<T>,
  onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
  onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
) {
  const thened = SAFE_THENED_WM.get(promise);
  if (thened && thened.cbs) {
    onfulfilled && thened.cbs.resolves.delete(onfulfilled);
    onrejected && thened.cbs.rejects.delete(onrejected);
  }
  return thened as BFChainUtil.SafeThendCache<T>;
}
