import { $Constructor } from "../typings/$types.ts";
import {
  $AutoResolveMatedata,
  $FactoryCustomInjectModule,
  $MODULE_ID_TYPE,
} from "./$types.ts";
import {
  AfterInit,
  getInjectionGroups,
  InjectionToken,
  OnInit,
} from "./common.ts";
import { ModuleStroge } from "./ModuleStroge.ts";
import {
  beforeCreateInstanceModuleStrogeStack,
  FACTORY_CUSTOM_INJECT_MODULE_MAP,
  INJECTION_TOKEN_SYMNOL,
  INJECTPROP_AFERTINIT_MATE_KEY,
  INJECTPROP_ONINIT_MATE_KEY,
  INSTANCE_MODULES_WM,
  SINGLETON_TOKEN_SYMNOL,
} from "./_inner.ts";

const _EMPTY_MAP = new Map();
function getFactoryCustomInjectModuleMap({
  target,
}: {
  target: any;
}): $FactoryCustomInjectModule {
  do {
    const map = FACTORY_CUSTOM_INJECT_MODULE_MAP.get(target);
    if (map) {
      return map;
    }
    target = Object.getPrototypeOf(target);
    if (target === Object.prototype || !target) {
      break;
    }
  } while (true);
  return _EMPTY_MAP;
}

/**
 * 实例化一个有依赖注入的构造器
 * @param Factory 构造函数
 * @param moduleMap 初始化的模块实例存储
 */
export function Resolve<T extends {}>(
  Factory: $Constructor<T>,
  moduleMap = new ModuleStroge()
) {
  /**这个构造器的标识名称 */
  const moduleName: $MODULE_ID_TYPE | undefined = (
    Factory as InjectionToken<T>
  )[INJECTION_TOKEN_SYMNOL];
  const isSingleton = (Factory as InjectionToken<T>)[SINGLETON_TOKEN_SYMNOL];
  const groups = getInjectionGroups(Factory);

  /**根据名称获取实例存储器中的对象 */
  let instance: (T & Partial<OnInit & AfterInit>) | undefined;
  if (isSingleton instanceof Factory) {
    moduleMap.set(moduleName, (instance = isSingleton));
  } else {
    instance = moduleMap.get(moduleName);
  }

  // console.group("Factory:", Factory.name);
  if (!instance) {
    /**获取构造函数的自定义依赖信息 */
    const modules = getFactoryCustomInjectModuleMap({ target: Factory });
    /**获取构造函数的参数 */
    const paramtypes = Reflect.getMetadata("design:paramtypes", Factory);
    const param_instances = paramtypes
      ? paramtypes.map((Con: $Constructor<any>, i: number) => {
          /**自定义依赖。通过在这里的自定义依赖来实现依赖反转 */
          const custom_inject_param_module = modules && modules.get(i);
          if (custom_inject_param_module !== undefined) {
            if (
              custom_inject_param_module.conf &&
              custom_inject_param_module.conf.optional
            ) {
              // skip empty check
            } else if (!moduleMap.has(custom_inject_param_module.id)) {
              throw new ReferenceError(
                `Need Inject Module '${String(
                  custom_inject_param_module.id
                )}' in ${String(moduleName)}`
              );
            }
            return moduleMap.get(custom_inject_param_module.id);
          }
          // 使用默认的实例化方法实例化依赖
          return Resolve(Con, moduleMap);
        })
      : [];
    /// 初始化模块并降至保持
    // console.log("param_instances", paramtypes, param_instances);
    beforeCreateInstanceModuleStrogeStack.push(moduleMap);
    instance = new Factory(...param_instances);
    beforeCreateInstanceModuleStrogeStack.pop();
    INSTANCE_MODULES_WM.set(instance, moduleMap);
    // 如果是单例模式，保存单例
    if (isSingleton) {
      (Factory as InjectionToken<T>)[SINGLETON_TOKEN_SYMNOL] = instance;
    }
    // 将模块缓存到map中
    if (moduleName !== undefined) {
      moduleMap.set(moduleName, instance);
    }
    // 将模块保存到插件组中
    for (const groupName of groups) {
      moduleMap.groupInsert(groupName, instance);
    }
    /// 生命周期的钩子

    if (typeof instance.bfOnInit === "function") {
      // 直接执行`bfOnInit`
      instance.bfOnInit();
    }
    /// 为其它注册为 onInit 的属性进行初始化
    const onInitMap: $AutoResolveMatedata | undefined = Reflect.getMetadata(
      INJECTPROP_ONINIT_MATE_KEY,
      Factory.prototype
    );
    if (onInitMap) {
      for (const [prop, data] of onInitMap) {
        (instance as any)[prop] = Resolve(data.injectModel, moduleMap);
      }
    }

    if (typeof instance.bfAfterInit === "function") {
      // 注册微任务执行`bfAfterInit`
      queueMicrotask(() => {
        instance!.bfAfterInit!();
      });
    }
    /// 为其它注册为 afterInit 的属性进行初始化
    const afterInitMap: $AutoResolveMatedata | undefined = Reflect.getMetadata(
      INJECTPROP_AFERTINIT_MATE_KEY,
      Factory.prototype
    );
    if (afterInitMap) {
      queueMicrotask(() => {
        for (const [prop, data] of afterInitMap) {
          (instance as any)[prop] = Resolve(data.injectModel, moduleMap);
        }
      });
    }
  }
  // console.groupEnd();
  return instance as T;
}
