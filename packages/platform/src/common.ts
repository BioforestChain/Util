import { isNodejs } from "./diff";
const checkType = (
  name: string,
  type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function",
) => {
  try {
    return new Function(`return typeof ${name} === "${type}"`)();
  } catch (_) {
    return false;
  }
};

export const isCordova = checkType("cordova", "object");

/**web worker and main thread all has location as navigator */
export const isWebView = checkType("navigator", "object");

export const isAndroid = isWebView && /Android/i.test(navigator.userAgent);

export const isIOS = isWebView && /iPhone|iPod|iPad/i.test(navigator.userAgent);

export const isWebMainThread = isWebView && checkType("document", "object");

export const isWebWorker = isWebView && !isWebMainThread;

export const platformInfo = {
  getGlobalFlag(flag_name: string, defaultValue = ""): string {
    const g = this.global() as any;
    return (
      g[flag_name] ||
      (g.process && g.process.env && g.process.env[flag_name]) ||
      (g.location && g.location.href && new URL(g.location.href).searchParams.get(flag_name)) ||
      (g.localStorage && g.localStorage.getItem(flag_name)) ||
      defaultValue
    );
  },
  global() {
    const globalThisGetter: () => typeof globalThis = () => {
      if (typeof globalThis === "object") {
        return globalThis;
        // Object.defineProperty(Object.prototype, "__globalThis_magic__", {
        //   get: function() {
        //     return this;
        //   },
        //   configurable: true,
        // });
        // //@ts-ignore
        // __globalThis_magic__.globalThis = __globalThis_magic__;
        // //@ts-ignore
        // delete Object.prototype.__globalThis_magic__;
      }
      if (typeof self === "object") {
        return ((self as any).globalThis = self);
      }
      if (typeof global === "object") {
        return ((global as any).globalThis = global);
      }
      return Function("return this")();
    };
    const g = globalThisGetter();
    this.global = () => g;
    return g;
  },
  platformName() {
    if (isNodejs) {
      return "Nodejs";
    }
    const device_name = isAndroid ? "Android" : isIOS ? "IOS" : "unknown";
    if (isCordova) {
      return "Cordova-" + device_name;
    }
    if (isWebMainThread) {
      return "WebMaster-" + device_name;
    }
    if (isWebWorker) {
      return "WebWorker-" + device_name;
    }
    return "UNKNOWN";
  },
  getChannel() {
    return "UNKNOWN";
  },
  getBusiness() {
    return "UNKNOWN";
  },
};
