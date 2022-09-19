import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12-2/mod.ts";
import { $Constructor } from "../typings/$types.ts";
import {
  $MODULE_ID_TYPE,
  $InjectModuleConfig,
  $FactoryCustomInjectModule,
  $AutoResolveMatedata,
} from "./$types.ts";
import { getInjectionToken } from "./common.ts";
import { Resolve } from "./Resolve.ts";
import {
  FACTORY_CUSTOM_INJECT_MODULE_MAP,
  getInstanceModules,
  INJECTPROP_AFERTINIT_MATE_KEY,
  INJECTPROP_ONINIT_MATE_KEY,
} from "./_inner.ts";

/**
 * 主动要求注入的模块
 * 如果我们依赖的是一个`Interface`，那么这种情况没有可用的构造函数可以让我们使用`@Injectable`去修饰模块
 * 这时候就必须在主动地声明依赖的名称，并在使用`Resolve`初始化的时候将对于的模块注入
 *
 * 也可以配合`@Injectable`实现依赖反转
 *
 * @param module_name
 */
export function Inject(
  inject_module?: $MODULE_ID_TYPE | $Constructor<object>,
  conf?: $InjectModuleConfig
) {
  return (
    target: any,
    prop_name: string,
    index?: number | PropertyDescriptor
  ) => {
    if (typeof index === "number") {
      const module_name =
        typeof inject_module === "function"
          ? getInjectionToken(inject_module)
          : inject_module;
      if (module_name !== undefined) {
        const modules: $FactoryCustomInjectModule =
          FACTORY_CUSTOM_INJECT_MODULE_MAP.get(target) || new Map();
        FACTORY_CUSTOM_INJECT_MODULE_MAP.set(target, modules);
        modules.set(index, { id: module_name, conf });
      }
    } else {
      if (inject_module === undefined) {
        throw new ReferenceError("inject_moudle should not be empty");
      }
      return InjectProp(inject_module, conf)(target, prop_name, index);
    }
  };
}

/**
 * 脏注入。
 * 一般用于模块循环依赖时，不建议使用，建议梳理清楚项目结构
 * @param inject_module_getter
 * @param conf
 * @returns
 */
export function DirtyInjectProp(
  inject_module_getter: () => $MODULE_ID_TYPE | $Constructor<object>,
  conf?: $InjectModuleConfig
) {
  return (target: any, prop_name: string, des?: PropertyDescriptor) => {
    const prop: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      get(this: any) {
        const inject_module = inject_module_getter();
        InjectProp(inject_module, conf)(target, prop_name, des);
        return this[prop_name];
      },
    };

    Object.defineProperty(target, prop_name, prop);
  };
}

export const enum AUTO_RESOLVE_PLOT {
  NO_RESOLVE,
  ON_GETTER,
  ON_INIT,
  AFTER_INIT,
}

function getInjectPropsMetadataMap(target: any, matedataKey: string) {
  let map: $AutoResolveMatedata | undefined = Reflect.getMetadata(
    matedataKey,
    target
  );
  if (!map) {
    map = new Map();
    Reflect.metadata(matedataKey, map)(target);
  }
  return map;
}

export function InjectProp(
  inject_module: $MODULE_ID_TYPE | $Constructor<object>,
  conf: $InjectModuleConfig = {}
) {
  const {
    dynamics: dynamicsGSetter,
    optional: allowUndefined,
    autoResolve,
    writable = true,
  } = conf;
  let autoResolvePlot: AUTO_RESOLVE_PLOT;
  if (autoResolve === false) {
    autoResolvePlot = AUTO_RESOLVE_PLOT.NO_RESOLVE;
  } else if (autoResolve === true || autoResolve === undefined) {
    autoResolvePlot = AUTO_RESOLVE_PLOT.ON_GETTER;
  } else {
    autoResolvePlot = autoResolve;
  }

  const module_name =
    typeof inject_module === "function"
      ? getInjectionToken(inject_module)
      : inject_module;
  if (module_name === undefined) {
    throw new TypeError(`module name is undefined`);
  }

  return (target: any, prop_name: string, des?: PropertyDescriptor) => {
    if (
      autoResolvePlot !== AUTO_RESOLVE_PLOT.NO_RESOLVE &&
      autoResolvePlot !== AUTO_RESOLVE_PLOT.ON_GETTER
    ) {
      if (typeof inject_module !== "function") {
        throw new TypeError(
          `${target} could not resolve prop '${prop_name}', inject_module not an function.`
        );
      }
      if (autoResolvePlot === AUTO_RESOLVE_PLOT.AFTER_INIT) {
        getInjectPropsMetadataMap(target, INJECTPROP_AFERTINIT_MATE_KEY).set(
          prop_name,
          {
            injectModel: inject_module,
          }
        );
      } else if (autoResolvePlot === AUTO_RESOLVE_PLOT.ON_INIT) {
        getInjectPropsMetadataMap(target, INJECTPROP_ONINIT_MATE_KEY).set(
          prop_name,
          {
            injectModel: inject_module,
          }
        );
      }
    }

    const getModule = (ins: any) => {
      const module_map = getInstanceModules(ins);
      if (!module_map) {
        throw new ReferenceError(
          `instance of ${ins.constructor.name} is not an instance which is created by Resolve`
        );
      }
      return module_map;
    };
    const moduleSetter = (ins: any, value: any) => {
      const module_map = getModule(ins);
      module_map.set(module_name, value);
    };
    const moduleGetter = (ins: any) => {
      const module_map = getModule(ins);

      if (module_map.has(module_name)) {
        return module_map.get(module_name);
      } else if (
        autoResolvePlot !== AUTO_RESOLVE_PLOT.NO_RESOLVE &&
        typeof inject_module === "function"
      ) {
        return Resolve(inject_module, module_map);
      } else if (!allowUndefined) {
        throw new ReferenceError(
          `module of ${String(module_name)} must been Injected first.`
        );
      }
    };

    const prop: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
    };
    if (dynamicsGSetter) {
      /// 动态属性
      if (writable) {
        prop.set = function (this: any, value: any) {
          moduleSetter(this, value);
          // des?.set?.call(this, value);
        };
      }
      prop.get = function (this: any) {
        // des?.get?.call(this, value);
        return moduleGetter(this);
      };
    } else {
      const freezeGSetter = (ins: any, value: any) => {
        Object.defineProperty(ins, prop_name, {
          value,
          writable,
          configurable: true,
          enumerable: true,
        });
      };
      /// 静态属性
      if (writable) {
        prop.set = function (this: any, value: any) {
          moduleSetter(this, value);
          freezeGSetter(this, value);
        };
      }
      prop.get = function (this: any) {
        const module_ins = moduleGetter(this);
        freezeGSetter(this, module_ins);
        return module_ins;
      };
    }
    Object.defineProperty(target, prop_name, prop);
  };
}
