export * from "../extends-iterator-is/index.ts";
/**
 * 混合排序输出
 * @param iteratorA
 * @param iteratorB
 * @param compareFu
 */
export async function* mixSortAsyncIterator<T>(
  iteratorA: AsyncIterableIterator<T> | IterableIterator<T>,
  iteratorB: AsyncIterableIterator<T> | IterableIterator<T>,
  compareFu: (a: T, b: T) => number
) {
  let itemAp = iteratorA.next();
  let itemA = itemAp instanceof Promise ? await itemAp : itemAp;
  let itemBp = iteratorB.next();
  let itemB = itemBp instanceof Promise ? await itemBp : itemBp;

  do {
    /// 如果混合排序完成，剩下的就是做最后的输出了
    if (itemB.done) {
      if (itemA.done) {
        break;
      }
      yield itemA.value;
      yield* iteratorA;
      break;
    }
    if (itemA.done) {
      yield itemB.value;
      yield* iteratorB;
      break;
    }
    /// 执行混合排序，返回一个值后就要进行迭代更新
    if (compareFu(itemA.value, itemB.value) >= 0) {
      /// 使用`>=` ，多了一个`===`的判定，优先返回内存对象
      yield itemA.value;
      itemAp = iteratorA.next();
      itemA = itemAp instanceof Promise ? await itemAp : itemAp;
    } else {
      yield itemB.value;
      itemBp = iteratorB.next();
      itemB = itemBp instanceof Promise ? await itemBp : itemBp;
    }
  } while (true);
}
/**
 * 混合排序输出
 * @param iteratorA
 * @param iteratorB
 * @param compareFu
 */
export function* mixSortIterator<T>(
  iteratorA: IterableIterator<T>,
  iteratorB: IterableIterator<T>,
  compareFu: (a: T, b: T) => number
) {
  let itemA = iteratorA.next();
  let itemB = iteratorB.next();

  do {
    /// 如果混合排序完成，剩下的就是做最后的输出了
    if (itemB.done) {
      if (itemA.done) {
        break;
      }
      yield itemA.value;
      yield* iteratorA;
      break;
    } else if (itemA.done) {
      yield itemB.value;
      yield* iteratorB;
      break;
    } else {
      /// 执行混合排序，返回一个值后就要进行迭代更新
      if (compareFu(itemA.value, itemB.value) >= 0) {
        /// 使用`>=` ，多了一个`===`的判定，优先返回内存对象
        yield itemA.value;
        itemA = iteratorA.next();
      } else {
        yield itemB.value;
        itemB = iteratorB.next();
      }
    }
  } while (true);
}

/**
 * 对迭代器的结果进行了长度约束
 * @param iteratorSource
 * @param limitOpts
 */
export async function* limitAsyncIterator<T>(
  iteratorSource: AsyncIterable<T>,
  limitOpts: {
    limit: number;
    tryKeepAborter?: (item: T, preItem?: T) => boolean;
  }
) {
  const { limit, tryKeepAborter } = limitOpts;

  let yieldedCount = 0;
  let preAccount: T | undefined;
  for await (const account of iteratorSource) {
    /**前置判断 */
    if (yieldedCount >= limit) {
      if (tryKeepAborter!(account, preAccount)) {
        /// 中断判断
        break;
      }
    }
    yieldedCount += 1;

    yield (preAccount = account);
    /**后置判断 */
    if (yieldedCount >= limit) {
      /// 如果需要获取更多，那么就将break交给前置判断
      if (!tryKeepAborter) {
        break;
      }
    }
  }
}
/**
 * 对迭代器的结果进行了长度约束
 * @param iteratorSource
 * @param limitOpts
 */
export function* limitIterator<T>(
  iteratorSource: Iterable<T>,
  limitOpts: {
    limit: number;
    tryKeepAborter?: (item: T, preItem?: T) => boolean;
  }
) {
  const { limit, tryKeepAborter } = limitOpts;

  let yieldedCount = 0;
  let preAccount: T | undefined;
  for (const account of iteratorSource) {
    /**前置判断 */
    if (yieldedCount >= limit) {
      if (tryKeepAborter!(account, preAccount)) {
        /// 中断判断
        break;
      }
    }
    yieldedCount += 1;

    yield (preAccount = account);
    /**后置判断 */
    if (yieldedCount >= limit) {
      /// 如果需要获取更多，那么就将break交给前置判断
      if (!tryKeepAborter) {
        break;
      }
    }
  }
}
/**
 * 过滤迭代器的结果
 * @param iteratorSource
 * @param mapper
 */
export async function* filterAsyncIterator<T>(
  iteratorSource: AsyncIterable<T> | Iterable<T>,
  filter: (item: T) => boolean
) {
  for await (const item of iteratorSource) {
    if (filter(item)) {
      yield item;
    }
  }
}
/**
 * 过滤迭代器的结果
 * @param iteratorSource
 * @param mapper
 */
export function* filterIterator<T>(
  iteratorSource: Iterable<T>,
  filter: (item: T) => boolean
) {
  for (const item of iteratorSource) {
    if (filter(item)) {
      yield item;
    }
  }
}
/**
 * 转换迭代器的输出
 * @param iteratorSource
 * @param mapper
 */
export async function* mapAsyncIterator<I, O>(
  iteratorSource: AsyncIterable<I> | Iterable<I>,
  mapper: (item: I) => O
) {
  for await (const item of iteratorSource) {
    yield mapper(item);
  }
}

/**
 * 转换迭代器的输出
 * @param iteratorSource
 * @param mapper
 */
export function* mapIterator<I, O>(
  iteratorSource: Iterable<I>,
  mapper: (item: I) => O
) {
  for (const item of iteratorSource) {
    yield mapper(item);
  }
}
