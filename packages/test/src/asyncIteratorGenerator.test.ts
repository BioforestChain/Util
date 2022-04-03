import test from "ava";
import { AsyncIteratorGenerator, ignoreAwait } from "@bfchain/util";
type A = { a: number; index?: number; hhhh?: number };
// test("AsyncIteratorGenerator", async (t) => {
ignoreAwait(
  (async () => {
    // const aig_1 = new AsyncIteratorGenerator<A>();
    // setTimeout(() => {
    //   console.log("done 1", res_1);
    //   aig_1.done();
    // }, 100);
    // const res_1: A[] = [];
    // for await (let item of aig_1) {
    //   res_1.push(item);
    // }
    // console.log(res_1);
    // console.log(res_1.length, 0);

    const aig_2 = new AsyncIteratorGenerator<A>();
    aig_2.on("push", ({ item, index }, next) => {
      // console.log(item, index);
      // console.log(`${index}`);
      item.index = index;
      return next();
    });
    const func = (obj: A, hhhh: number) => {
      obj.hhhh = hhhh;
      // console.log(obj)
      return obj;
    };
    setTimeout(() => {
      // console.log("push [0] 1");
      const b = { a: 3 };
      aig_2.pushCalc(() => func(b, 6666), 3);
      const a = { a: 0 };
      aig_2.pushCalc(() => func(a, 5555), 0);
      // console.log("push [3] 2");
      // console.log("push [1] 3");
      const c = { a: 2 };
      aig_2.pushCalc(() => func(c, 7777), 2);
      // console.log("push [2] 4");
      const d = { a: 1 };
      aig_2.pushCalc(() => func(d, 8888), 1);
      ignoreAwait(aig_2.done());
    }, 100);
    const res_2: A[] = [];
    for await (const item of aig_2) {
      // console.log("item", item, aig_2.list);
      res_2.push(item);
    }
    console.log(res_2);
    // console.log(res_2, [
    //   { a: 0, index: 0 },
    //   { a: 1, index: 1 },
    //   { a: 2, index: 2 },
    //   { a: 3, index: 3 },
    // ]);
    // });
  })(),
);
