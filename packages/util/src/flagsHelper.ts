import { ModuleStroge, Resolve, Injectable } from "@bfchain/util-dep-inject";
@Injectable()
export class FlagParamStack {
  private _instanceParamWM = new WeakMap<object, unknown>();
  getParam(ins: object) {
    return this._instanceParamWM.get(ins);
  }
  setParam(ins: object, v: unknown) {
    this._instanceParamWM.set(ins, v);
  }
}

const QuotedStringReg = /"(?:\.|(\\\")|[^\""\n])*"|'(?:\.|(\\\')|[^\''\n])*'/g;
@Injectable()
export class FlagsHelper {
  constructor(private moduleMap: ModuleStroge, private flagParamStack: FlagParamStack) {}
  private strToBool_(value: string) {
    const valueLower = value.toLowerCase();
    if (valueLower === "disable" || valueLower === "disabled" || valueLower === "false") {
      return false;
    }
    if (
      valueLower === "enable" ||
      valueLower === "enabled" ||
      valueLower === "true" ||
      valueLower === ""
    ) {
      return true;
    }
    return value;
  }
  private _formatString(value: string) {
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      return value.slice(1, -1);
    }
    return value;
  }
  /**
   * 参数解析
   */
  parse(flags: string) {
    const stringValueCache: string[] = [];
    const stringPlaceholder = `_PLACE_${Math.random().toString(36).slice(2)}_HOLDER_`;
    const flagList = flags
      .replace(QuotedStringReg, (m) => {
        stringValueCache.push(m);
        return stringPlaceholder;
      })
      .split(/\s+/)
      .filter((flag) => !!flag);
    const flagMap = new Map<string, boolean | number | string | undefined>();
    for (const flag of flagList) {
      const equal = flag.indexOf("=");
      let key: string;
      let param: boolean | number | string = "";
      let value: boolean | number | string | undefined;
      if (equal === -1) {
        key = flag;
      } else {
        key = flag.substr(0, equal);
        if (key.includes(stringPlaceholder)) {
          throw new Error(
            `Flags format error: ${key.replace(
              stringPlaceholder,
              stringValueCache.shift() || stringPlaceholder,
            )} is invilde.`,
          );
        }
        param = flag.substr(equal + 1).replace(new RegExp(stringPlaceholder, "g"), (ph) => {
          const sourceStr = stringValueCache.shift();
          if (!sourceStr) {
            throw new Error();
          }
          return sourceStr;
        });
      }
      const flagInfo = this._flagInfomationMap.get(flag);

      if (flagInfo) {
        switch (flagInfo.type) {
          case "boolean":
            value = Boolean(this.strToBool_(param));
            break;
          case "number":
            const numParam = Number.parseFloat(param);
            if (Number.isNaN(numParam)) {
              value = undefined;
            } else {
              value = numParam;
            }

            break;
          case "string":
            value = this._formatString(param);
            break;
        }
      } else {
        /// try to bool
        value = this.strToBool_(param);
        /// try to num
        if (typeof value === "string") {
          const numberMayby = parseFloat(value);
          if (numberMayby.toString() === value) {
            value = numberMayby;
          }
        }
        /// try to string
        if (typeof value === "string") {
          value = this._formatString(value);
        }
      }

      /// 先进行移除再进行赋值，确保顺序是跟着覆盖的值的位置
      flagMap.delete(key);
      flagMap.set(key, value);
    }
    return flagMap;
  }
  quote(flagMap: Map<string, boolean | number | string | undefined>) {
    const flags: string[] = [];
    for (let [key, value] of flagMap) {
      if (value === undefined) {
        flags.push(key);
      } else {
        if (typeof value === "string") {
          value = JSON.stringify(value);
        }
        flags.push(`${key}=${value}`);
      }
    }
    return flags.join(" ");
  }
  private _applyedFlagMap = new Map<string, string | number | boolean | undefined>();
  /**
   * 应用参数，触发注册的回调
   * @param flags
   */
  applyFlags(flags: string | Map<string, boolean | number | string | undefined>) {
    if (!(flags instanceof Map)) {
      flags = this.parse(flags);
    }
    for (const [flag, value] of flags) {
      this.setFlagValue(flag, value);
    }
    return (this._applyedFlagMap = flags);
  }
  getFlagValue(flag: string) {
    return this._applyedFlagMap.get(flag);
  }
  setFlagValue(flag: string, value?: boolean | number | string) {
    const flagInfo = this._flagInfomationMap.get(flag);
    if (flagInfo) {
      if (value === false) {
        if (flagInfo.onDisable instanceof Function) {
          flagInfo.onDisable();
        }
        this._applyedFlagMap.delete(flag);
      } else {
        if (flagInfo.onEnable instanceof Function) {
          flagInfo.onEnable(value);
        }
        this._applyedFlagMap.set(flag, value);
      }
      return true;
    }
    return false;
  }
  hasFlag(flag: string) {
    return this._applyedFlagMap.has(flag);
  }
  getApplyedFlags() {
    return this.quote(this._applyedFlagMap);
  }
  private _flagInfomationMap = new Map<
    string,
    {
      type: "string" | "number" | "boolean";
      onEnable?: Function;
      onDisable?: Function;
    }
  >();
  registerBooleanFlag(flag: string, onEnable?: Function, onDisable?: Function) {
    if (this._flagInfomationMap.has(flag)) {
      throw new Error(`Duplicate registration boolean flag: ${flag}.`);
    }
    this._flagInfomationMap.set(flag, {
      type: "boolean",
      onEnable,
      onDisable,
    });
  }
  registerStringFlag(flag: string, onEnable?: (value: string) => unknown, onDisable?: Function) {
    if (this._flagInfomationMap.has(flag)) {
      throw new Error(`Duplicate registration string flag: ${flag}.`);
    }
    this._flagInfomationMap.set(flag, {
      type: "string",
      onEnable,
      onDisable,
    });
  }
  registerNumberFlag(flag: string, onEnable?: (value: number) => unknown, onDisable?: Function) {
    if (this._flagInfomationMap.has(flag)) {
      throw new Error(`Duplicate registration number flag: ${flag}.`);
    }
    this._flagInfomationMap.set(flag, {
      type: "number",
      onEnable,
      onDisable,
    });
  }
  registerInjectionFlag(
    flag: string,
    ModuleFactory: BFChainUtil.FirstArgument<typeof Resolve>,
    type: "string" | "number" | "boolean" = "boolean",
  ) {
    if (this._flagInfomationMap.has(flag)) {
      throw new Error(`Duplicate registration injection flag: ${flag}.`);
    }
    this._flagInfomationMap.set(flag, {
      type,
      onEnable: (v: unknown) => {
        const moduleMap = this.moduleMap;
        const ins = Resolve(
          ModuleFactory,
          moduleMap.installMask(new ModuleStroge([[FLAG_INJECTION_PARAM, v]])),
        );
        this.flagParamStack.setParam(ins, v);
      },
    });
  }
}
/**
 * 专门用于构造函数的临时flag
 */
export const FLAG_INJECTION_PARAM = Symbol("flag param in constructor");
