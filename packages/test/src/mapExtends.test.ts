import test from "ava";
import {
  EasyWeakMap,
  EasyMap,
  EventCleanerIsolation,
  EventEmitter,
  EventEmitterPro,
} from "@bfchain/util";

class A extends EventEmitterPro<{ say: [string] }> {
  id = Math.random();
}

const a = new A();
const a_iso = new EventCleanerIsolation(a);
a.on("say", (x) => {});
a.onEmit((a) => {
  if (a.eventname === "say") {
    a.args;
  }
});
// a.once()

test("EasyWeakMap with EventCleanerIsolation", (t) => {
  const ewm = new EasyWeakMap((a: A) => new EventCleanerIsolation(a));
  const zz = new EasyMap(
    (a: A) => new EventCleanerIsolation(a),
    undefined,
    (a) => a.id,
  );
  t.pass();
});
