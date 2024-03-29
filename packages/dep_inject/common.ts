import { $Constructor } from "../typings/$types.ts";
import { $MODULE_ID_TYPE } from "./$types.ts";
import {
  GROUP_TOKEN_SYMNOL,
  INJECTION_TOKEN_SYMNOL,
  SINGLETON_TOKEN_SYMNOL,
} from "./_inner.ts";

/**带有可注入依赖模块名字的构造函数 */
export interface InjectionToken<T> extends $Constructor<T> {
  [INJECTION_TOKEN_SYMNOL]: $MODULE_ID_TYPE;
  [SINGLETON_TOKEN_SYMNOL]: T | boolean;
  [GROUP_TOKEN_SYMNOL]?: $MODULE_ID_TYPE[];
}

/**获取构造函数的模块名称 */
export function getInjectionToken(Ctor: any) {
  return Ctor[INJECTION_TOKEN_SYMNOL] as $MODULE_ID_TYPE | undefined;
}
/**获取构造函数的分组名称 */
export function getInjectionGroups(Ctor: any) {
  const groups = new Set<$MODULE_ID_TYPE>();
  let curCtor = Ctor;
  do {
    const curGroups = curCtor[GROUP_TOKEN_SYMNOL];
    if (curGroups) {
      for (const groupName of curGroups) {
        groups.add(groupName);
      }
      curCtor = Object.getPrototypeOf(curCtor);
      if (!curCtor) {
        break;
      }
    } else {
      break;
    }
  } while (true);
  return groups;
}

//#region 依赖注入模块的生命周期

export interface OnInit {
  bfOnInit(): unknown;
}

export interface AfterInit {
  bfAfterInit(): unknown;
}
//#endregion
