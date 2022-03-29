/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */
import { ms } from "@bfchain/util-ms";
import { bindThis, cacheGetter } from "@bfchain/util-decorator";
import { EasyMap } from "@bfchain/util-extends-map";

/**
 * Convert regexp to namespace
 *
 * @param {RegExp} regxep
 * @return {String} namespace
 * @api private
 */
export function regexpToNamespace(regexp: RegExp) {
  return regexp.source
    .slice(1, -1)
    .replace(/\.\*\?$/, "*")
    .replace(/\\/g, "");
}

export function transformNamespaceToFilter(namespace: string) {
  const disable = namespace[0] === "-";
  return {
    type: disable ? "disable" : "enable",
    source: namespace,
    regexp: new RegExp("^" + namespace.substr(disable ? 1 : 0).replace(/\*/g, ".*?") + "$"),
  } as BFChainUtilLogger.NamespaceFilter;
}
export function transformFilterToNamespace(filter: BFChainUtilLogger.NamespaceFilter) {
  return (filter.type === "disable" ? "-" : "") + regexpToNamespace(filter.regexp);
}

/**
 * 这个类只会执行一次
 * 只是因为涉及到多个平台的不同实现，所以这里使用非即时执行的方式，用Class进行包裹实现
 */
export abstract class DebugCreater<ColorType> {
  constructor() {
    this.setNamespaceFilter(this.load());
  }

  // private _namespaces: string[] = [];
  abstract colors: ColorType[];
  abstract get colorTypeName(): string;
  protected abstract load(): string;
  protected abstract save(namespace: string): void;
  abstract canUseColors(): boolean;
  abstract formatArgs(
    debug: Debug<ColorType>,
    args: BFChainUtilLogger.LogArgs,
    scope: BFChainUtilLogger.Scope<ColorType>,
  ): void;

  abstract init?(debug: Debug<ColorType>): void;
  abstract printArgs(
    debug: Debug<ColorType>,
    args: BFChainUtilLogger.LogArgs,
    scope: BFChainUtilLogger.Scope<ColorType>,
  ): void;

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */
  abstract formatters: { [key: string]: (debug: Debug<ColorType>, val: unknown) => string }; // = {};

  //#region Namespace & Filter
  /**
   * The currently active debug mode names, and names to skip.
   */
  public readonly namespaceFilters: BFChainUtilLogger.NamespaceFilter[] = [];
  /**
   * Disable debug output.
   *
   * @return {String} namespaces
   * @api public
   */
  getNamespaceFilter() {
    // const namespaces = this.namespaceFilters.map(
    //   checker => (checker.type === "disable" ? "-" : "") + toNamespace(checker.filter),
    // );
    // return namespaces;
    return this.namespaceFilters.map((f) => f.source);
  }
  /**
   * 重置所有日志实例是否可用
   */
  private _resetInstancesEnabled() {
    for (const instance of this._createdDebugCache.values()) {
      instance.forceSetEnabled(this.isEnabled(instance.namespace, instance.level));
      for (const scope of instance.scopePrinterMap.keys()) {
        scope.enabled = this.levelFilter(scope.level);
      }
    }
  }
  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */
  setNamespaceFilter(namespaces: string | string[]) {
    namespaces = typeof namespaces === "string" ? namespaces : namespaces.join(",");
    /// reset
    this.namespaceFilters.length = 0;

    const split = [...new Set(namespaces.split(/[\s,]+/))];

    for (const namespace of split) {
      if (!namespace) {
        // ignore empty strings
        continue;
      }

      this.namespaceFilters.push(transformNamespaceToFilter(namespace));
    }

    this._resetInstancesEnabled();

    /// 保存现在的命名空间过滤集
    this.save(split.join(","));
  }
  addNamespaceFilter(filter: string | BFChainUtilLogger.NamespaceFilter, pos?: number) {
    /// 先进行移除，然后再将新的过滤器放置到指定的位置
    this.removeNamespaceFilter(filter);
    filter = typeof filter === "string" ? transformNamespaceToFilter(filter) : filter;
    if (pos === undefined || pos > this.namespaceFilters.length - 1 || pos < 0) {
      this.namespaceFilters.push(filter);
    } else {
      this.namespaceFilters.splice(pos, 0, filter);
    }
    this._resetInstancesEnabled();
    this.save(this.getNamespaceFilter().join(","));
  }
  removeNamespaceFilter(filter: number | string | BFChainUtilLogger.NamespaceFilter): boolean {
    const removeAt = (index: number) => {
      if (index >= 0 && index < this.namespaceFilters.length) {
        this.namespaceFilters.splice(index, 1);
        this._resetInstancesEnabled();
        this.save(this.getNamespaceFilter().join(","));
        return true;
      }
      return false;
    };
    if (typeof filter === "number") {
      return removeAt(filter);
    }
    if (typeof filter === "string") {
      const index = this.namespaceFilters.findIndex((f) => f.source === filter);
      return removeAt(index);
    }
    const index = this.namespaceFilters.indexOf(filter);
    return removeAt(index) || this.removeNamespaceFilter(transformFilterToNamespace(filter));
  }
  //#endregion

  //#region Level
  private _levelFilter: BFChainUtilLogger.LevelFilter = (level) => true;
  public get levelFilter(): BFChainUtilLogger.LevelFilter {
    return this._levelFilter;
  }
  public set levelFilter(value: BFChainUtilLogger.LevelFilter) {
    this._levelFilter = value;
    this._resetInstancesEnabled();
  }

  //#endregion
  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */
  isEnabled(name: string, level: BFChainUtilLogger.DebugLevel) {
    if (!this.levelFilter(level)) {
      return false;
    }
    if (name[name.length - 1] === "*") {
      return true;
    }
    /// 倒序判定，越往后的规则优先级越高
    for (let i = this.namespaceFilters.length - 1; i >= 0; i--) {
      const namespaceFilter = this.namespaceFilters[i];
      if (namespaceFilter.regexp.test(name)) {
        return namespaceFilter.type === "enable";
      }
    }
    return false;
  }

  /**
   * Selects a color for a debug namespace
   * @param {String} namespace The namespace string for the for the debug instance to be colored
   * @return {Number|String} An ANSI color code for the given namespace
   * @api private
   */
  selectColor(namespace: string) {
    let hash = 0;

    for (let i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return this.colors[Math.abs(hash) % this.colors.length];
  }
  private _createdDebugCache: EasyMap<string, Debug<ColorType>> = new EasyMap<
    string,
    Debug<ColorType>
  >((namespace) => new Debug(namespace, this));
  /**
   * 获取创建过的命名空间
   */
  getCreatedDebugs() {
    return this._createdDebugCache.values();
  }

  /**生成一个命名空间创建一个日志打印器 */
  create(namespace: string): Debug<ColorType> {
    return this._createdDebugCache.forceGet(namespace);
  }
  destroy(namespace: string) {
    return this._createdDebugCache.delete(namespace);
  }
}

export class Debug<ColorType> {
  private _config: BFChainUtilLogger.DebuggerConfig<ColorType>;
  get useColors() {
    return this._config.useColors;
  }
  forceSetUseColors(useColors: boolean) {
    this._config.useColors = useColors;
  }
  get enabled() {
    return this._config.enabled;
  }
  forceSetEnabled(v: boolean) {
    this._config.enabled = v;
  }
  get color() {
    return this._config.color;
  }
  get level() {
    return this._config.level;
  }
  get enableTime() {
    return this._config.enableTime;
  }
  get enableDuration() {
    return this._config.enableDuration;
  }
  getDiff() {
    return this._curr - this._prev;
  }
  private __prev = 0;
  private __curr = 0;
  protected get _prev() {
    return this.__prev;
  }
  protected get _curr() {
    return this.__curr || (this.__curr = Date.now());
  }
  protected _resetDiff() {
    this.__prev = this.__curr;
    this.__curr = 0;
  }

  constructor(
    public readonly namespace: string,
    private _creater: DebugCreater<ColorType>,
    opts?: BFChainUtilLogger.DebuggerOptions,
  ) {
    // env-specific initialization logic for debug instances
    if (typeof _creater.init === "function") {
      _creater.init(this);
    }
    let level = 0;
    let enableTime = false;
    let enableDuration = false;
    if (opts) {
      if (opts.enableTime !== undefined) {
        enableTime = opts.enableTime;
      }
      if (opts.enableDuration !== undefined) {
        enableDuration = opts.enableDuration;
      }
      if (opts.level !== undefined) {
        level = opts.level;
      }
    }

    this._config = {
      useColors: this._creater.canUseColors(),
      enabled: this._creater.isEnabled(this.namespace, level),
      color: this._creater.selectColor(this.namespace),
      level,
      enableTime,
      enableDuration,
    };

    return this;
  }
  getDuration() {
    return ms(this.getDiff()) as string;
  }
  @cacheGetter
  private get _dater() {
    return new Date();
  }
  getTime() {
    this._dater.setTime(Date.now());
    return this._dater.toLocaleTimeString();
  }
  destroy() {
    this._config.enabled = false;
    this._creater.destroy(this.namespace);
  }
  @cacheGetter
  get print() {
    return this.scopePrinterMap.forceGet(this._config);
  }

  //#region Printer Builder
  @bindThis
  createPrinter(color: ColorType, level: BFChainUtilLogger.DebugLevel): BFChainUtilLogger.Pinter {
    const scope = this._scope.forceGet(color).forceGet(level);
    return this.scopePrinterMap.forceGet(scope);
  }
  @bindThis
  deletePrinter(color: ColorType, level: BFChainUtilLogger.DebugLevel): boolean {
    const levelMap = this._scope.tryGet(color);
    if (levelMap) {
      const scope = levelMap.tryGet(level);
      if (scope) {
        levelMap.delete(level);
        return this.scopePrinterMap.delete(scope);
      }
    }
    return false;
  }

  private _scope = new EasyMap<
    ColorType,
    EasyMap<
      BFChainUtilLogger.DebugLevel,
      BFChainUtilLogger.Scope<ColorType> & {
        id: number;
      }
    >
  >((color) => {
    const map = EasyMap.from({
      creater: (level: BFChainUtilLogger.DebugLevel) => {
        return {
          id: this._scopeIdAcc++,
          color,
          level,
          enabled: this._creater.levelFilter(level),
        };
      },
      afterDelete: () => {
        if (map.size === 0) {
          this._scope.delete(color);
        }
      },
    });
    return map;
  });
  private _scopeIdAcc = 0;

  public readonly scopePrinterMap = EasyMap.from<
    BFChainUtilLogger.Scope<ColorType>,
    BFChainUtilLogger.Pinter
  >({
    creater: (scope) => {
      return this._printerBuilder(scope);
    },
  });

  /**禁用默认的格式化输出，因系统console.log中有自带 */
  protected $enableDefaultFormatter = false;

  private _printerBuilder(scope: BFChainUtilLogger.Scope<ColorType>) {
    const { _creater } = this;
    const isEnabled = () => scope.enabled && this.enabled;
    const print: BFChainUtilLogger.Pinter = ((...args: unknown[]) => {
      // Disabled?
      if (!isEnabled()) {
        return;
      }

      // reset `diff` timestamp
      this._resetDiff();

      let format = typeof args[0] !== "string" ? "%O" : (args.shift() as string);

      // Apply any `formatters` transformations
      if (this.$enableDefaultFormatter) {
        let index = 0;
        format = format.replace(/%([a-zA-Z%])/g, (match, format) => {
          // If we encounter an escaped % then don't increase the array index
          if (match === "%%") {
            return match;
          }
          const formatter = _creater.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter(this, val);

            // Now we need to remove `args[index]` since it's inlined in the `format`
            args.splice(index, 1);
            index--;
          }
          index++;
          return match;
        });
      }

      const logArgs = [format, ...args] as BFChainUtilLogger.LogArgs;
      // Apply env-specific formatting (colors, etc.)
      _creater.formatArgs(this, logArgs, scope);

      _creater.printArgs(this, logArgs, scope);
    }) as never;
    Object.defineProperty(print, "enabled", { get: isEnabled });
    return print;
  }
  //#endregion
}
export enum LOGGER_LEVEL {
  log,

  info,
  warn,
  trace,

  success,
  error,
}
