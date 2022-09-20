import { $InjectableOptions, $MODULE_ID_TYPE } from "./$types.ts";
import {
  GROUP_TOKEN_SYMNOL,
  INJECTION_TOKEN_SYMNOL,
  SINGLETON_TOKEN_SYMNOL,
} from "./_inner.ts";

/**
 * 将模块定义为可注入的依赖
 * 会根据构造函数的名字自动生成，所以`module_name`可以缺省
 * 但是特定情况下，可以利用这个`module_name`配合`@Inject`主动地声明依赖，来实现依赖反转
 * @param module_name
 * @param opts 可选配置项
 */
export function Injectable(
  opts?:
    | $MODULE_ID_TYPE
    | ({
        module_name?: $MODULE_ID_TYPE;
      } & $InjectableOptions),
  opts2?: $InjectableOptions
) {
  return (Ctor: any) => {
    let moduleName: $MODULE_ID_TYPE | undefined;
    let singleton: boolean | undefined;
    let groups: $MODULE_ID_TYPE[] | undefined;
    if (typeof opts === "object") {
      moduleName = opts.module_name;
      opts2 = opts;
      singleton = opts.singleton;
    } else {
      moduleName = opts;
    }
    if (moduleName === undefined) {
      moduleName = Symbol(Ctor.name);
    }
    if (opts2) {
      if (opts2.singleton !== undefined) {
        singleton = opts2.singleton;
      }
      if (opts2.group !== undefined) {
        if (typeof opts2.group === "boolean") {
          if (opts2.group === true) {
            groups = [moduleName];
          }
        } else if (opts2.group instanceof Array) {
          groups = opts2.group;
        } else {
          groups = [opts2.group];
        }
      }
    }

    Ctor[INJECTION_TOKEN_SYMNOL] = moduleName;
    Ctor[SINGLETON_TOKEN_SYMNOL] = !!singleton;
    if (groups) {
      Ctor[GROUP_TOKEN_SYMNOL] = groups;
    }
  };
}
