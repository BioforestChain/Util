import { Injectable } from "../dep_inject/index.ts";
import { cacheGetter } from "../decorator/index.ts";

@Injectable()
export class IpHelper {
  @cacheGetter
  private get v4() {
    return "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}";
  }

  @cacheGetter
  private get v6seg() {
    return "[a-fA-F\\d]{1,4}";
  }

  @cacheGetter
  private get v6() {
    const { v4, v6seg } = this;
    return `
    (
    (?:${v6seg}:){7}(?:${v6seg}|:)|                                // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
    (?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)|                         // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
    (?:${v6seg}:){5}(?::${v4}|(:${v6seg}){1,2}|:)|                 // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
    (?:${v6seg}:){4}(?:(:${v6seg}){0,1}:${v4}|(:${v6seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
    (?:${v6seg}:){3}(?:(:${v6seg}){0,2}:${v4}|(:${v6seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
    (?:${v6seg}:){2}(?:(:${v6seg}){0,3}:${v4}|(:${v6seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
    (?:${v6seg}:){1}(?:(:${v6seg}){0,4}:${v4}|(:${v6seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
    (?::((?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))           // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
    )(%[0-9a-zA-Z]{1,})?                                           // %eth0            %1
    `
      .replace(/\/\/.*$/gm, "") // 去掉注释
      .replace(/(^\s+)|(\s+$)|\s+/g, "") // 去掉空格
      .replace(/\n/g, ""); // 去掉换行符
  }

  /**
   * 是否是一个 ip
   *
   * @param ip
   */
  isIp(ip: string) {
    const { v4, v6 } = this;
    const pattern = new RegExp(`(?:^${v4}$)|(?:^${v6}$)`);
    return pattern.test(ip);
  }

  /**
   * 是否是一个 ipV4
   *
   * @param ipV4
   */
  isIpV4(ipV4: string) {
    const { v4 } = this;
    const pattern = new RegExp(`^${v4}$`);
    return pattern.test(ipV4);
  }

  /**
   * 是否是一个 ipV6
   *
   * @param ipV6
   */
  isIpV6(ipV6: string) {
    const { v6 } = this;
    const pattern = new RegExp(`^${v6}$`);
    return pattern.test(ipV6);
  }

  ipv4ToUint32(ip: string) {
    return ip
      .split(".")
      .reduce((acc, v, i) => acc + +v * Math.pow(256, 3 - i), 0);
  }
  uint32ToIpv4(ip: number) {
    // const l1 = ip / 256 ** 3;
    // const l2 = ip / 256 ** 2 - l1 * 256;
    // const l3 = ip / 256 - l1 * 256 ** 2 - l2**1;
    const l4 = ip % 256;
    const l3 = ((ip % 65536) / 256) | 0;
    const l2 = ((ip % 16777216) / 65536) | 0;
    const l1 = (ip / 16777216) | 0;
    return `${l1}.${l2}.${l3}.${l4}`;
  }
}
