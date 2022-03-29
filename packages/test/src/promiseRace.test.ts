import test from "ava";
import { PromiseRace, safePromiseRace, sleep, Aborter, ignoreAwait } from "@bfchain/util";

test("safePromiseRace", async (t) => {
  t.is(await safePromiseRace([1]), 1);
  t.is(await safePromiseRace([Promise.resolve(2.2), 2]), 2);
  t.is(await safePromiseRace([Promise.resolve(3), sleep(1, () => 3.3)]), 3);
});
test("new PromiseRace", async (t) => {
  const race = new PromiseRace<number>();
  const aborter = new Aborter();
  race.addRacer(aborter.abortedPromise);

  let result: number | undefined;
  ignoreAwait(Promise.resolve(race.race()).then((res) => {
    result = res;
  }));
  t.is(race.size, 1);

  await sleep(100);
  t.is(result, undefined);
  t.is(race.size, 1);

  race.addRacer(sleep(1, () => 1));
  race.addRacer(sleep(2, () => 2));
  t.is(race.size, 3);

  await sleep(100);
  t.is(result, 1);
  t.is(await race.race(), 2);

  t.is(race.size, 1);
  race.removeRacer(aborter.abortedPromise);
  t.is(race.size, 0);
});

test("noRacer", async (t) => {
  const race = new PromiseRace<number>({ throwWhenNoRacer: true });
  await t.throwsAsync(
    async () => {
      await race.race();
    },
    { instanceOf: RangeError, message: "no racer to race" },
  );
});
