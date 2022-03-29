/**用于标识可注入依赖模块名字的Symbol标识 */
export const INJECTION_TOKEN_SYMNOL = Symbol("InjectionToken");
/**用于标记模块是单利模式的Symbol标识 */
export const SINGLETON_TOKEN_SYMNOL = Symbol("SingletonToken");
/**用于标记模块是插件模式的Symbol标识 */
export const GROUP_TOKEN_SYMNOL = Symbol("GroupToken");

/**
 * 存储构造函数的`@Inject`修饰信息
 * 可以让构造函数在初始化的时候将特定的依赖进行注入
 */
export const FACTORY_CUSTOM_INJECT_MODULE_MAP = new WeakMap<
  BFChainUtil.Constructor<any>,
  BFChainUtil.FactoryCustomInjectModule
>();

/**
 * 对象与其ModelStroge的映射
 */
export const INSTANCE_MODULES_WM = new WeakMap<any, import("./").ModuleStroge>();
/**
 * 对象在实例化的过程中，因为还没有正式return出来
 * 所以就还没有在`INSTANCE_MODULES_WM`中建立映射
 * 这里就使用调用堆栈的形式来进行临时保存
 * 这样在需要在使用`InjectProp`创建getter的时候，不会因为马上需要`ModuleStroge`而又因为实例对象还没建立好映射而导致问题
 */
export const beforeCreateInstanceModuleStrogeStack: import("./").ModuleStroge[] = [];
export function getInstanceModules(ins: any) {
  return (
    INSTANCE_MODULES_WM.get(ins) ||
    beforeCreateInstanceModuleStrogeStack[beforeCreateInstanceModuleStrogeStack.length - 1]
  );
}
export const INJECTPROP_AFERTINIT_MATE_KEY = "injectProps:afertInit";
export const INJECTPROP_ONINIT_MATE_KEY = "injectProps:onInit";
