import test from "ava";
import { loggerCreater } from "@bfchain/util";
test("logger", (t) => {
  const logger = loggerCreater.create("qaq");
  t.log(logger.useColors);
  logger.print("%c%s A %s", "color:red", "B", "C");
  t.pass();
});
