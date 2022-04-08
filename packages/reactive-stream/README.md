# Reactive-Stream

BFChain 的响应式编程工具类

与 Rxjs 的函数式编程风格相比，它围绕 WebStream 来展开（这方面，web、nodejs、deno 都有原生的支持）。
在 WebStream 的基础上提供了丰富的工具，从而实现健壮的响应式编程。

Reactive-Stream 建立在 WebStream 之上，提供了导出 AsyncIterator 的功能。
Reactive-Stream 与 AsyncIterator 的关系，正如 PromiseOut 相对于 Promise 的关系。

<!--
```ts
class ListFetcher<T> {
  getData(): T[];
}
class ItemFetcher {
  constructor(listFetcher: ListFetcher, index: number) {}
}

/**基于时间间隔的数据请求器 */
const intervalFetcher = new IntervalFetcher<R>({
  /**更新的时间间隔 */
  interval: "5h",
  /**初始化逻辑，可空。
   * 如果为空，那么就直接走 update 的更新逻辑
   */
  init: async () => {
    /// 从数据库加载本地数据
    const localList = await myListDb.find({ limit: 20, offset: 0 });
    return localList;
  },
  /**更新逻辑 */
  update: async (oldList: R | undefined) => {
    const oldIds = new Set(oldList?.map((item) => item.id));
    /// 从远端下载列表数据
    const remoteList: R = (await (await fetch("./list")).json()).filter(
      (item) => oldIds.has(item.id) === false,
    );

    /// 下载附加数据，组合成完整的列表
    await Promise.all(
      remoteList.map(async (item) => {
        const detail = await (await fetch("./detail?id=" + item.detail_id)).json();
        item.detail = detail;
      }),
    );

    [].slice;
    /// 更新到数据库中
    await myListDb.upsertMany(remoteList);

    /// 对图片资源做预加载
    const preloadImageList = remoteList.map((item) => item.images).flat();
    for (const image of preloadImageList) {
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
    }

    /// 将所有的列表数据整合在一起
    const allList: R = [...remoteList, ...oldList];

    /// 不存储超过2000条数据
    allList.length = Math.min(allList.length, 2000);

    return allList;
  },
});

class ListFetcher {
  async *itemFetcher(index: number) {
    fetch(`./list/index/${index}`);
  }
}

/// 用法
class Page {
  /**整个列表的数据 */
  private allPageList = [];
  /**要渲染的数量 */
  private showCount = 20;
  /**要渲染的内容 */
  public showList = [];

  @willVisiable
  async initData() {
    /// 加载数据
    for await (const list of intervalFetcher(showCount)) {
      this.allPageList = list;
      this.showList = list.slice(0, this.showCount);
    }
    /// 分页
  }
}

const complexFetcher = new UniFlowGenerator({
  parent: [],
});
```
-->
