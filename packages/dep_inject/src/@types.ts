declare namespace BFChainUtil {
  //#region Inject
  type MODULE_ID_TYPE = string | symbol | number;
  type FactoryCustomInjectModule = Map<number, { id: MODULE_ID_TYPE; conf?: InjectModuleConfig }>;
  type InjectModuleConfig = {
    dynamics?: boolean;
    autoResolve?: boolean | import("./Inject").AUTO_RESOLVE_PLOT;
    optional?: boolean;
    writable?: boolean;
  };
  type InjectableOptions = {
    /**全局单例 */
    singleton?: boolean;
    /**分组模块，这件会影响到其子类 */
    group?: MODULE_ID_TYPE | MODULE_ID_TYPE[] | boolean;
  };
  type ResolvableOptions = {};
  type ConfigCustomInjectModule = Map<number, InjectModuleConfig>;
  type AutoResolveMatedata =  Map<string, { injectModel: BFChainUtil.Constructor<object> }>
  //#endregion
}
