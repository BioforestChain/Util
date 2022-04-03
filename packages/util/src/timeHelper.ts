import { UtilExceptionGenerator } from "@bfchain/util-exception";
import { Injectable, ModuleStroge, Inject } from "@bfchain/util-dep-inject";
import { PlatformHelper } from "./platformHelper";
import { sleep } from "@bfchain/util-extends-promise";
const { info } = UtilExceptionGenerator("util", "TimeHelper");

export const TIME_HELPER_ARGS = {
  TIME_SPEED: "TIME_SPEED",
};
/**区块链时间模块 */
@Injectable()
export class TimeHelper {
  /**
   * @param platformHelper
   * @param TIME_SPEED 时间速度
   */
  constructor(
    protected platformHelper: PlatformHelper,
    @Inject(TIME_HELPER_ARGS.TIME_SPEED, { optional: true })
    public readonly TIME_SPEED = 1,
  ) {
    this.SYSTEM_START_TIME = this.platformHelper.performance.timeOrigin;
    if (!(typeof TIME_SPEED === "number" && TIME_SPEED > 0)) {
      this.TIME_SPEED = 1;
    }
    info("TIME SPPED × %d.", this.TIME_SPEED);
  }
  /**定时器 */
  setTimeout(fun: Function, ms: number) {
    return setTimeout(fun, ms / this.TIME_SPEED);
  }
  setInterval(fun: Function, ms: number) {
    return setInterval(fun, ms / this.TIME_SPEED);
  }
  clearTimeout = clearTimeout;
  clearInterval = clearInterval;
  sleep(ms: number, onresolve?: () => unknown) {
    return sleep(ms / this.TIME_SPEED, onresolve);
  }

  /**系统启动时间 */
  readonly SYSTEM_START_TIME: number;
  /**时间偏移量，毫秒 */
  time_offset_ms = 0;
  get BLOCKCHAIN_SYSTEM_START_TIME() {
    return this.SYSTEM_START_TIME + this.time_offset_ms;
  }
  /**获取当前区块链时间
   * PS: performance.now()+timeOrigin不能用来替代Date.now()
   * 但是Date.now又有可能被操作系统影响
   * 至少我们不希望时间回退，这会带来很多问题，但是允许时间前进到未来
   * 所以这里基于二者，来将时间强行卡在未来
   * 可以通过修改time_offset_ms来进行调整
   */
  now(forceRounding = false) {
    const pnow =
      this.platformHelper.performance.now() + this.SYSTEM_START_TIME + this.time_offset_ms;
    const dnow = Date.now();
    const diff = dnow - pnow;
    if (diff > 1) {
      this.time_offset_ms += diff;
    }

    const result =
      this.SYSTEM_START_TIME +
      (this.platformHelper.performance.now() + this.time_offset_ms) * this.TIME_SPEED;

    if (!forceRounding) {
      return result;
    }

    return parseInt(result.toString());
  }

  static NOW_DIFF_SYMBOL = Symbol("now-diff-ms");
  /**
   * 穿梭时间
   * @param diffMs 正数，往未来。负数，往过去
   */
  changeNowByDiff(diffMs: number) {
    const { NOW_DIFF_SYMBOL } = TimeHelper;
    const oldDiff = Reflect.get(Date, NOW_DIFF_SYMBOL);
    // 调整timeHelper.now的返回
    this.time_offset_ms += diffMs - (oldDiff || 0);
    /// 重写Date.now
    if (diffMs !== 0) {
      if (oldDiff === undefined) {
        const sourceNow = Date.now;
        const customNow = (Date.now = () => sourceNow() + Reflect.get(Date, NOW_DIFF_SYMBOL));
        Reflect.set(customNow, "source", sourceNow);
      }
      Reflect.set(Date, NOW_DIFF_SYMBOL, diffMs);
    } else {
      /// 恢复Date.now
      const customNow = Date.now;
      const sourceNow = Reflect.get(customNow, "source");
      if (sourceNow !== undefined) {
        Date.now = sourceNow;
        Reflect.deleteProperty(Date, NOW_DIFF_SYMBOL);
      }
    }
  }
  changeNowByTime(time: number) {
    const { NOW_DIFF_SYMBOL } = TimeHelper;
    const oldDiff = Reflect.get(Date, NOW_DIFF_SYMBOL) || 0;
    const newDiff = time - (Date.now() - oldDiff);
    return this.changeNowByDiff(newDiff);
  }
  //#endregion

  //#region 通用的格式化时间
  formatDate(date: Date, format = "yyyy-MM-dd hh:mm:ss") {
    type ruleType = "M+" | "d+" | "h+" | "m+" | "s+" | "q+" | "E" | "W" | "S";
    const moon = date.getMonth() + 1;
    const rule = {
      "M+": moon, // 月
      "d+": date.getDate(), // 日
      "h+": date.getHours(), // 时
      "m+": date.getMinutes(), // 分
      "s+": date.getSeconds(), // 秒
      "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
      E: ["冬", "春", "夏", "秋"][Math.floor((moon % 12) / 3)], // 季节
      W: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()], // 星期
      S: date.getMilliseconds(), // 毫秒
    };
    let formatRes = format;
    if (/(y+)/.test(formatRes))
      formatRes = formatRes.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length),
      ); // 年
    for (const analytical in rule) {
      if (new RegExp("(" + analytical + ")").test(formatRes)) {
        formatRes = formatRes.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? "" + rule[analytical as ruleType]
            : ("00" + rule[analytical as ruleType]).substr(
                ("" + rule[analytical as ruleType]).length,
              ),
        );
      }
    }
    return formatRes;
  }
  formatDateTime(time = this.now()) {
    return this.formatDate(new Date(time));
  }
  formatYMDHMS(year: number, month: number, day: number, h: number, m: number, s: number) {
    const ps = (num: number, maxLength = 2) => String(num).padStart(maxLength, "0");
    return `${ps(year, 4)}-${ps(month)}-${ps(day)} ${ps(h)}:${ps(m)}:${ps(s)}`;
  }
  //#endregion
}
