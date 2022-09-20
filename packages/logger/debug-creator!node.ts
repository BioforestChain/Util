import { format, inspect } from "https://deno.land/std@0.156.0/node/util.ts";
import { bindThis, cacheGetter } from "../decorator/index.ts";
import { $NodeJS } from "../typings/$types.ts";
import { $LogArgs, $Scope } from "./$types.ts";
import { Debug, DebugCreater, LOGGER_LEVEL } from "./common.ts";

/**
 * for nodejs
 */
declare const process: $NodeJS.Process;
/**
 * This is the Node.js implementation of `debug()`.
 */
class NodejsDebugCreater extends DebugCreater<number> {
  get colorTypeName() {
    return "node" as const;
  }
  init?(debug: Debug<number>): void;
  @cacheGetter
  get utilFormat() {
    return format;
  }
  @cacheGetter
  get utilInspect() {
    return inspect;
  }

  @cacheGetter
  get colors() {
    /// "6,2,3,4,5,1"
    return "20,21,26,27,32,33,38,39,40,41,42,43,44,45,56,57,62,63,68,69,74,75,76,77,78,79,80,81,92,93,98,99,112,113,128,129,134,135,148,149,160,161,162,163,164,165,166,167,168,169,170,171,172,173,178,179,184,185,196,197,198,199,200,201,202,203,204,205,206,207,208,209,214,215,220,221"
      .split(",")
      .map((v) => parseInt(v, 10));
  }

  /**
   * Build up the default `inspectOpts` object from the environment variables.
   *
   *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
   */
  inspectOpts = Object.keys(this.nodeProcess.env)
    .filter((key) => {
      return /^debug_/i.test(key);
    })
    .reduce((obj, key) => {
      // Camel-case
      const prop = key
        .substring(6)
        .toLowerCase()
        .replace(/_([a-z])/g, (_, k) => {
          return k.toUpperCase();
        });

      // Coerce string value into JS value
      const source = this.nodeProcess.env[key];
      let target: boolean | null | number | undefined;
      if (typeof source === "string") {
        if (/^(yes|on|true|enabled)$/i.test(source)) {
          target = true;
        } else if (/^(no|off|false|disabled)$/i.test(source)) {
          target = false;
        }
      } else if (source === "null") {
        target = null;
      }
      if (target === undefined) {
        target = Number(source);
      }

      obj[prop] = target;
      return obj;
    }, {} as { [key: string]: boolean | null | number });

  // @cacheGetter
  // get getDate() {
  //   return this.inspectOpts.hideDate ? () => "" : () => new Date().toISOString() + " ";
  // }

  canUseColors() {
    return "colors" in this.inspectOpts
      ? Boolean(this.inspectOpts.colors)
      : /**
         * Is stdout a TTY? Colored output is enabled when `true`.
         */
        this.nodeProcess.stderr.isTTY;
  }
  /**
   * Adds ANSI color escape codes if enabled.
   *
   * @api public
   */

  formatArgs(
    debug: Debug<number>,
    args: $LogArgs,
    scope: $Scope<number> = debug
  ) {
    const { namespace, useColors } = debug;
    const color = scope.color;

    /// 关闭样式
    let stylePlaceholderCount = 0;
    args[0] = args[0].replace(RegExp(this._htmlStylePlaceholder, "g"), () => {
      stylePlaceholderCount += 1;
      if (stylePlaceholderCount > 1) {
        // 关闭前一个样式
        return `\u001B[0m`;
      }
      return "";
    });
    if (stylePlaceholderCount > 0) {
      // 关闭最后一个样式
      args[0] += `\u001B[0m`;
    }

    if (useColors) {
      const colorCode = `\u001B[3${color < 8 ? color : "8;5;" + color}`;
      let prefix = `${colorCode};1m${namespace} \u001B[0m`;
      if (debug.enableTime) {
        prefix = `[${debug.getTime()}] ${prefix}`;
      }

      args[0] = prefix + args[0].split("\n").join("\n" + prefix);
      if (debug.enableDuration) {
        args.push(`${colorCode};1m +${debug.getDuration()}\u001B[0m`);
      }
    } else {
      let prefix = `${namespace} `;
      if (debug.enableTime) {
        prefix = `[${debug.getTime()}] ${prefix}`;
      }

      args[0] = prefix + args[0].split("\n").join("\n" + prefix);

      if (debug.enableDuration) {
        args.push(` +${debug.getDuration()}`);
      }
    }
    return args;
  }
  @cacheGetter
  get nodeProcess() {
    return process;
  }
  /**
   * Invokes `util.format()` with the specified arguments and writes to stderr.
   */
  @bindThis
  printArgs(
    debug: Debug<number>,
    args: $LogArgs,
    scope: $Scope<number> = debug
  ) {
    switch (scope.level) {
      case LOGGER_LEVEL.log:
        console.log(this.utilFormat(...args));
        break;
      case LOGGER_LEVEL.info:
        console.info(this.utilFormat(...args));
        break;
      case LOGGER_LEVEL.warn:
        console.warn(this.utilFormat(...args));
        break;
      case LOGGER_LEVEL.trace:
        console.trace(this.utilFormat(...args));
        break;
      case LOGGER_LEVEL.success:
        console.info(this.utilFormat(...args));
        break;
      case LOGGER_LEVEL.error:
        console.error(this.utilFormat(...args));
        break;
    }
  }
  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */
  protected save(namespaces: string) {
    if (namespaces) {
      this.nodeProcess.env.DEBUG = namespaces;
    } else {
      // If you set a process.env field to null or undefined, it gets cast to the
      // string 'null' or 'undefined'. Just delete instead.
      delete this.nodeProcess.env.DEBUG;
    }
  }
  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */

  protected load() {
    return this.nodeProcess.env.DEBUG || "";
  }

  private readonly _htmlStylePlaceholder = `HSP${Math.random()
    .toString(36)
    .substr(2)}`;

  formatters = {
    c: (debug: Debug<number>, v: unknown) => {
      let res = "";
      if (debug.useColors && typeof v === "string") {
        for (const style of v.split(/[;\s]+/)) {
          const [name, value] = style.split(/[:\s]+/);
          if (name === "color") {
            const c = HTML_COLOR_MAP[value];
            if (c) {
              const colorCode = "\u001B[3" + (c < 8 ? c : "8;5;" + c);
              res += `${colorCode};1m${this._htmlStylePlaceholder}`;
            }
          }
          // @TODO background-color,text-delaction
        }
      }
      return res;
    },

    /**
     * Map %o to `util.inspect()`, all on a single line.
     */

    o: (debug: Debug<number>, v: unknown) => {
      return this.formatters.O(debug, v).replace(/\s*\n\s*/g, " ");
    },

    /**
     * Map %O to `util.inspect()`, allowing multiple lines if needed.
     */

    O: (debug: Debug<number>, v: unknown) => {
      const innerInspect = Object.create(this.inspectOpts);
      innerInspect.colors = debug.useColors;
      return this.utilInspect(v, innerInspect);
    },
    t(_debug: Debug<number>, v: unknown) {
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
    s(debug: Debug<number>, v: unknown) {
      return String(v);
    },
    d(debug: Debug<number>, v: unknown) {
      return Number(v).toString();
    },
  };
}
const HTML_COLOR_MAP: { [key: string]: number } = {
  white: 7,
  cyan: 6,
  magenta: 5,
  blue: 4,
  yellow: 3,
  orange: 3,
  green: 2,
  red: 1,
  darkred: 1,
  black: 0,
};
const DebugCreaterFactory = () => new NodejsDebugCreater();
export default DebugCreaterFactory;
