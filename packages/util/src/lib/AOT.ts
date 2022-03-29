/**用于将一些函数在运行的过程中，跳过一些固有的等待条件，使得运行更快*/
export class AOT {
  constructor(public id = "anonymous", default_condition = false) {
    this.condition = default_condition;
  }
  autoRegister(target: object) {
    const aot_flags = AOT_Placeholder.GetAOTFlags(target);
    if (!aot_flags) {
      return;
    }
    for (const aot_flag of aot_flags) {
      if (aot_flag.type === "Then") {
        const then_data = aot_flag.data;
        this.register(target, then_data.prop_name, this.Then(then_data.then_fun_name));
      } else if (aot_flag.type === "Wait") {
        const wait_data = aot_flag.data;
        this.register(
          target,
          wait_data.prop_name,
          this.Wait(wait_data.condition_promise_fun_name, wait_data.skip_if_false),
        );
      }
    }
  }
  private _getPropDescriptor(target: object, name: string) {
    let proto = target;
    do {
      if (proto.hasOwnProperty(name)) {
        return Object.getOwnPropertyDescriptor(proto, name);
      }
      proto = Object.getPrototypeOf(proto);
      if (!proto) {
        break;
      }
    } while (true);
  }
  register(
    target: any,
    name: string,
    declaration: (target: any, name: string, des: PropertyDescriptor) => PropertyDescriptor,
  ) {
    const des = this._getPropDescriptor(target, name);
    if (des) {
      Object.defineProperty(target, name, declaration(target, name, des));
    }
  }
  /**JIT运行时的条件属性*/
  condition: boolean;
  /**是否进行静态链接*/
  compile_into = false;
  /**条件语句*/
  Then(then_fun_name: string) {
    const self = this;
    return (target: unknown, name: string, des: PropertyDescriptor) => {
      const source_fun = des.value;
      des.value = function(this: any, ...args: unknown[]) {
        const { condition } = self;
        if (self.compile_into) {
          this[name] = condition ? this[then_fun_name] : source_fun;
        }
        if (condition) {
          return this[then_fun_name](...args);
        } else {
          return source_fun.apply(this, args);
        }
      };
      des.value.source_fun = source_fun;
      return des;
    };
  }
  /**前置条件*/
  Wait(condition_promise_fun_name: string, skip_if_false = false) {
    const self = this;
    return (target: unknown, name: string, des: PropertyDescriptor) => {
      const source_fun = des.value;
      des.value = function(this: any, ...args: unknown[]) {
        const { condition } = self;
        if (self.compile_into) {
          if (!condition) {
            console.warn(`[${self.id}]`, "AOT-Wait's condition must be true");
          }
          this[name] = source_fun;
        } else {
          console.warn(`[${self.id}]`, `JIT mode run ${name}`);
        }
        if (!condition) {
          // 在条件不成立的时候，需要始终进行条件判断的等待
          const condition = this[condition_promise_fun_name];
          return (condition instanceof Function
            ? this[condition_promise_fun_name](...args)
            : Promise.resolve(condition)
          ).then((pre_condition_res: unknown) => {
            if (skip_if_false && !pre_condition_res) {
              return;
            }
            return source_fun.apply(this, args);
          });
        } else {
          return source_fun.apply(this, args);
        }
      };
      des.value.source_fun = source_fun;
      return des;
    };
  }
  compile(condition: boolean) {
    if (this.compile_into) {
      return false;
    }
    this.condition = condition;
    return (this.compile_into = true);
  }
}

const AOT_FLAGS_CACHE = new WeakMap<object, aot_flag[]>();
type aot_flag =
  | {
      type: "Then";
      data: { then_fun_name: string; prop_name: string };
    }
  | {
      type: "Wait";
      data: {
        condition_promise_fun_name: string;
        skip_if_false: boolean;
        prop_name: string;
      };
    };
export class AOT_Placeholder {
  static GetAOTFlags(target: object) {
    const aot_flags: aot_flag[] = [];
    let proto = target;
    do {
      const _flags = AOT_FLAGS_CACHE.get(proto);
      if (_flags) {
        aot_flags.push(..._flags);
      }
      proto = Object.getPrototypeOf(proto);
      if (!proto) {
        break;
      }
    } while (true);
    return aot_flags;
  }
  static GetAndSetAOTFlags(target: object) {
    let aot_flags = AOT_FLAGS_CACHE.get(target);
    if (!aot_flags) {
      aot_flags = [];
      AOT_FLAGS_CACHE.set(target, aot_flags);
    }
    return aot_flags;
  }
  static Then(then_fun_name: string) {
    return (target: object, name: string, des: PropertyDescriptor) => {
      this.GetAndSetAOTFlags(target).push({
        type: "Then",
        data: { then_fun_name, prop_name: name },
      });
      return des;
    };
  }
  static Wait(condition_promise_fun_name: string, skip_if_false = false) {
    return (target: object, name: string, des: PropertyDescriptor) => {
      this.GetAndSetAOTFlags(target).push({
        type: "Wait",
        data: { condition_promise_fun_name, skip_if_false, prop_name: name },
      });
      return des;
    };
  }
}
