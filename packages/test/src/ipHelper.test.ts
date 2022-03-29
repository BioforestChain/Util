import test from "ava";
import { IpHelper, Resolve } from "@bfchain/util";

test("IpHelper", (t) => {
  const ipHelper = Resolve(IpHelper);

  t.true(ipHelper.isIp("127.0.0.1"));

  t.true(ipHelper.isIpV4("127.0.0.255"));

  t.false(ipHelper.isIpV4("127.0.0.256"));

  t.true(ipHelper.isIpV6("001:2:3:4:5:6:7:8"));

  t.true(ipHelper.isIpV6("FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF"));

  t.false(ipHelper.isIpV6("001:2:3:4:5:6:7:FFFG"));

  t.false(ipHelper.isIpV6("127.0.0.1"));

  t.false(ipHelper.isIp("unicorn 192.168.110.1 cake 1:2:3:4:5:6:7:8 ranbow"));
});
