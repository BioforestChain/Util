export type $NamespaceFilterType = "enable" | "disable";
export type $NamespaceFilter = {
  type: $NamespaceFilterType;
  source: string;
  regexp: RegExp;
};
export type $LevelFilter = (level: $DebugLevel) => boolean;

export type $LogArgs = [string, ...unknown[]];
export type $DebugLevel = number;
export type $DebuggerConfig<ColorType> = {
  color: ColorType;
  enabled: boolean;
  useColors: boolean;
  enableTime: boolean;
  enableDuration: boolean;
  level: $DebugLevel;
};
export type $DebuggerOptions = {
  enableTime?: boolean;
  enableDuration?: boolean;
  level?: $DebugLevel;
};

//#region Pinter
export type $Scope<ColorType> = {
  color: ColorType;
  level: number;
  enabled: boolean;
};
export type $Pinter = { readonly enabled: boolean } & ((
  ...args: unknown[]
) => void);

//#endregion

// deno-lint-ignore no-namespace
export namespace $Browser {
  export interface HtmlNamespace {
    buildHTML(style: string): void;
    toHTML(): string;
  }
  export interface HtmlDuration {
    buildHTML(style: string): void;
    toHTML(): string;
  }
}
