import test from "ava";
import { ObjectZoom } from "@bfchain/util";
test("objectZoom", async (t) => {
  type MyZOOM_OBJ = { a: number; b: string; c: boolean };
  const zoom = new ObjectZoom<MyZOOM_OBJ>(undefined, new Map([["a_b", ["a", "b"]]]));
  const zobj_1 = zoom.fromObject({ a: 1, b: "qaq", c: true });
  zoom.fromObject({ a: 1, b: "qaq", c: false });
  zoom.fromObject({ a: 2, b: "qaq", c: true });
  zoom.fromObject({ a: 3, b: "qaq", c: true });
  zoom.fromObject({ a: 2, b: "qvq", c: true });
  zoom.fromObject({ a: 3, b: "qvq", c: true });
  const zobj_2 = zoom.fromObject({ a: 1, c: true, b: "qaq" });
  t.is(zobj_1, zobj_2);

  const index = zoom.indexs.get("a_b");
  if (!index) {
    throw new ReferenceError("index a_b no found");
  }
  const zobj_set = index.valueRef.get(index.keyzoom.fromObject({ a: 1, b: "qaq" }));
  t.true(zobj_set && zobj_set.has(zobj_1));
  t.is(zobj_set && zobj_set.size, 2);
});
