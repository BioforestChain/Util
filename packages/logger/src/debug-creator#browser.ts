import { DebugCreater, Debug, LOGGER_LEVEL } from "./common";
import { cacheGetter } from "@bfchain/util-decorator";

/**
 * This is the web browser implementation of `debug()`.
 */
class BrowserDebugCreater extends DebugCreater<string> {
  get colorTypeName() {
    return "browser" as const;
  }
  init?(debug: Debug<string>): void;
  @cacheGetter
  get colors() {
    return "0000CC 0000FF 0033CC 0033FF 0066CC 0050c8 006080 005c99 006800 00681a 006733 00654c 006363 006179 3300CC 3300FF 3333CC 3232fb 2b55aa 274ec4 205f7e 1e5b97 1a6700 1a671a 196633 19644b 196262 186078 6600CC 6500fd 6633CC 5c2ee6 326500 326419 9100c2 8300da 842cb1 7928ca 496100 486018 b60000 b4002d b00058 a9007e 9f009f 9500ba a72a00 a62a2a a32951 9d2776 952595 8c23af 8c4600 8b4523 715400 70541c 5c5c00 5b5b17 b50024 b20047 ad0068 a70086 ac2200 ab2222 a82243 a42163 9f207f 981e98 973d00 973c1e 804d00 804d1a 6c5600 6c5616"
      .split(" ")
      .map((c) => "#" + c);
  }
  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */
  @cacheGetter
  private get storage() {
    try {
      // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
      // The Browser also has localStorage in the global context.
      return localStorage;
    } catch (error) {
      // Swallow
      // XXX (@Qix-) should we be logging these?
    }
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */
  protected load() {
    let r: string | undefined | null;
    r = this.storage && this.storage.getItem("debug");

    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }

    return r || "";
  }
  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */
  protected save(namespaces: string) {
    if (this.storage) {
      if (namespaces) {
        this.storage.setItem("debug", namespaces);
      } else {
        this.storage.removeItem("debug");
      }
    }
  }
  /**
   * 这里只考虑现代浏览器，无条件支持吧
   */
  canUseColors() {
    return true;
  }

  private static _NamespaceWithToHtmlCache = new WeakMap<
    Debug<string>,
    BFChainUtilLogger.Browser.HtmlNamespace
  >();
  private static _namespaceCtor =
    new Function(`return class Namespace extends String {
    buildHTML(style) {
      if ((this.buildHTML.tmpStyle = style)) {
        this.buildHTML.tmpStyle = style;
        this.buildHTML.tmpHTML = \`<i class="logger-namespace" style="\${style}">\${this}ms</i>\`;
      }
    }
    toHTML() {
      return this.buildHTML.tmpHTML || this.toString();
    }
  }`)() as BFChainUtil.Constructor<BFChainUtilLogger.Browser.HtmlNamespace>;
  private static _getHtmlNamespace(debug: Debug<string>) {
    let hnsp = this._NamespaceWithToHtmlCache.get(debug);
    if (hnsp === undefined) {
      hnsp = new this._namespaceCtor(debug.namespace);
      this._NamespaceWithToHtmlCache.set(debug, hnsp);
    }
    return hnsp;
  }

  // private static _DurationWithToHtmlCache = new WeakMap<
  //   Debug<string>,
  //   BFChainUtilLogger.Browser.HtmlDuration
  // >();
  private static _durationCtor = new Function(
    `return class Duration extends Number {
      buildHTML(style) {
        if ((this.buildHTML.tmpStyle = style)) {
          this.buildHTML.tmpStyle = style;
          this.buildHTML.tmpHTML = \`<i class="logger-duration" style="\${style}">+\${this}</i>\`;
        }
      }
      toHTML() {
        return this.buildHTML.tmpHTML || this.toString();
      }
    }`
  )() as BFChainUtil.Constructor<BFChainUtilLogger.Browser.HtmlDuration>;
  private static _getHtmlDuration(duration: number /* debug: Debug<string> */) {
    const hdur = new this._durationCtor(duration);
    return hdur;
  }

  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  formatArgs(
    debug: Debug<string>,
    args: BFChainUtilLogger.LogArgs,
    scope: BFChainUtilLogger.Scope<string> = debug
  ) {
    const c0 = "color: " + scope.color;
    if (debug.useColors) {
      const cs: unknown[] = [];
      const hnsp = BrowserDebugCreater._getHtmlNamespace(debug);
      hnsp.buildHTML(c0);
      if (debug.enableTime) {
        args[0] = `[%s] %o %c${args[0]}`;
        cs[cs.length] = debug.getTime();
        cs[cs.length] = hnsp;
      } else {
        args[0] = `%o ${args[0]}`;
        cs[cs.length] = hnsp;
      }
      args.splice(1, 0, ...cs);
    } else {
      args[0] = `${debug.namespace} ${args[0]}`;
      if (debug.enableTime) {
        args[0] = `[${debug.getTime()}] ${args[0]}`;
      }
    }

    if (debug.enableDuration) {
      if (debug.useColors) {
        const hdur = BrowserDebugCreater._getHtmlDuration(debug.getDiff());
        hdur.buildHTML(c0);
        args[args.length] = hdur;
      } else {
        args.push(`+${debug.getDuration()}`);
      }
    }
    return args;
  }
  printArgs(
    debug: Debug<string>,
    args: BFChainUtilLogger.LogArgs,
    scope: BFChainUtilLogger.Scope<string> = debug
  ) {
    switch (scope.level) {
      case LOGGER_LEVEL.log:
        console.log(...args);
        break;
      case LOGGER_LEVEL.info:
        console.info(...args);
        break;
      case LOGGER_LEVEL.warn:
        console.warn(...args);
        break;
      case LOGGER_LEVEL.trace:
        console.trace(...args);
        break;
      case LOGGER_LEVEL.success:
        console.info(...args);
        break;
      case LOGGER_LEVEL.error:
        console.error(...args);
        break;
    }
  }

  formatters = {
    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */

    j(debug: Debug<string>, v: unknown) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return (
          "[UnexpectedJSONParseError]: " +
          (error instanceof Error ? error.message : error)
        );
      }
    },
    t(debug: Debug<string>, v: unknown) {
      let date: string | number | Date;
      switch (typeof v) {
        case "string":
        case "number":
          date = v;
          break;
        default:
          if (v instanceof Date) {
            date = v;
          } else {
            date = String(v);
          }
      }
      return new Date(date).toLocaleString();
    },
    s(debug: Debug<string>, v: unknown) {
      return String(v);
    },
    d(debug: Debug<string>, v: unknown) {
      return Number(v).toString();
    },
  };
}

const DebugCreaterFactory = () => new BrowserDebugCreater();
export default DebugCreaterFactory;
