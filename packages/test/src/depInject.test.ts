import test from "ava";
import {
  Injectable,
  Inject,
  Resolve,
  ModuleStroge,
  MODULE_MAP,
  getInjectionGroups,
  cacheGetter,
} from "@bfchain/util";

test("Injectable group", (t) => {
  (global as any).console = t;
  @Injectable({ group: true })
  class A {}

  @Injectable()
  class AA extends A {}

  const mm = new ModuleStroge();
  const aa = Resolve(AA, mm);
  const groupA = mm.groupGet(A);

  t.is(groupA.size, 1);
  t.true(groupA.has(aa));

  @Injectable({ group: "b" })
  class AB extends A {}
  const ab = Resolve(AB, mm);
  const groupA2 = mm.groupGet(A);
  t.is(groupA2.size, 2);
  t.true(groupA2.has(aa));
  t.true(groupA2.has(ab));

  @Injectable({ group: ["c", ...getInjectionGroups(AB)] })
  class AC extends A {}
  const ac = Resolve(AC, mm);
  const groupA3 = mm.groupGet(A);
  t.is(groupA3.size, 3);
  t.true(groupA3.has(ac));

  const groupAB = mm.groupGet(AB);
  t.is(groupAB.size, 2);
  t.true(groupAB.has(ac));
  t.true(groupAB.has(ab));
});
test("ModuleStroge mask", (t) => {
  const m1 = new ModuleStroge([["a", 1]]);
  const m1_m1 = m1.installMask(
    new ModuleStroge([
      ["a", 110],
      ["b", 220],
    ]),
  );
  t.is(m1_m1.get("a"), 110);
  m1_m1.set("a", 2);
  t.is(m1_m1.get("a"), 110);
  t.is(m1.get("a"), 2);
  t.is(m1.get("xxx"), undefined);
  t.is(m1_m1.get(MODULE_MAP), m1_m1);
  t.is(m1_m1.uninstallMask(), m1);
});
