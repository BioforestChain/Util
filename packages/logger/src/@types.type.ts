declare namespace BFChainUtilLogger {
  type NamespaceFilterType = "enable" | "disable";
  type NamespaceFilter = {
    type: NamespaceFilterType;
    source: string;
    regexp: RegExp;
  };
  type LevelFilter = (level: DebugLevel) => boolean;

  type LogArgs = [string, ...unknown[]];
  type DebugLevel = number;
  type DebuggerConfig<ColorType> = {
    color: ColorType;
    enabled: boolean;
    useColors: boolean;
    enableTime: boolean;
    enableDuration: boolean;
    level: DebugLevel;
  };
  type DebuggerOptions = {
    enableTime?: boolean;
    enableDuration?: boolean;
    level?: DebugLevel;
  };

  //#region Pinter
  type Scope<ColorType> = {
    color: ColorType;
    level: number;
    enabled: boolean;
  };
  type Pinter = { readonly enabled: boolean } & ((...args: unknown[]) => void);

  //#endregion

  namespace Browser {
    interface HtmlNamespace {
      buildHTML(style: string): void;
      toHTML(): string;
    }
    interface HtmlDuration {
      buildHTML(style: string): void;
      toHTML(): string;
    }
  }
}
