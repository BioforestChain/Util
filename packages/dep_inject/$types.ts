import { $Constructor } from "../typings/$types.ts";
import type { AUTO_RESOLVE_PLOT } from "./Inject.ts";

//#region Inject
export type $MODULE_ID_TYPE = string | symbol | number;
export type $FactoryCustomInjectModule = Map<
  number,
  { id: $MODULE_ID_TYPE; conf?: $InjectModuleConfig }
>;
export type $InjectModuleConfig = {
  dynamics?: boolean;
  autoResolve?: boolean | AUTO_RESOLVE_PLOT;
  optional?: boolean;
  writable?: boolean;
};
export type $InjectableOptions = {
  /**全局单例 */
  singleton?: boolean;
  /**分组模块，这件会影响到其子类 */
  group?: $MODULE_ID_TYPE | $MODULE_ID_TYPE[] | boolean;
};
export type $ResolvableOptions = {};
export type $ConfigCustomInjectModule = Map<number, $InjectModuleConfig>;
export type $AutoResolveMatedata = Map<
  string,
  { injectModel: $Constructor<object> }
>;
//#endregion
