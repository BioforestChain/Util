import { bindThis } from "./bindThis";

// 存储在原型链上的数据（字符串）集合
export class PropArrayHelper<T = any> {
  constructor(
    public pid = Math.random()
      .toString(36)
      .substr(2),
  ) {}
  CLASS_PROTO_ARRAYDATA_POOL = new Map<string | Symbol, Map<string, T[]>>();
  PA_ID_KEY = Symbol(`@PAID:${this.pid}`);
  @bindThis
  get(target: any, key: string | symbol) {
    const res = new Set<T>();
    const CLASS_PROTO_ARRAYDATA = this.CLASS_PROTO_ARRAYDATA_POOL.get(key);
    if (CLASS_PROTO_ARRAYDATA) {
      do {
        if (target.hasOwnProperty(this.PA_ID_KEY)) {
          const arr_data = CLASS_PROTO_ARRAYDATA.get(target[this.PA_ID_KEY]);
          if (arr_data) {
            for (const item of arr_data) {
              res.add(item);
            }
          }
        }
      } while ((target = Object.getPrototypeOf(target)));
    }
    return res;
  }
  PA_ID_VALUE = 0;
  @bindThis
  add(target: any, key: string | symbol, value: T) {
    let CLASS_PROTO_ARRAYDATA = this.CLASS_PROTO_ARRAYDATA_POOL.get(key);
    if (!CLASS_PROTO_ARRAYDATA) {
      CLASS_PROTO_ARRAYDATA = new Map();
      this.CLASS_PROTO_ARRAYDATA_POOL.set(key, CLASS_PROTO_ARRAYDATA);
    }

    const pa_id = target.hasOwnProperty(this.PA_ID_KEY)
      ? target[this.PA_ID_KEY]
      : (target[this.PA_ID_KEY] = Symbol(`@PAID:${this.pid}#${this.PA_ID_VALUE++}`));
    let arr_data = CLASS_PROTO_ARRAYDATA.get(pa_id);
    if (!arr_data) {
      arr_data = [value];
      CLASS_PROTO_ARRAYDATA.set(pa_id, arr_data);
    } else {
      arr_data.push(value);
    }
  }
  @bindThis
  remove(target: any, key: string | symbol, value: T) {
    const CLASS_PROTO_ARRAYDATA = this.CLASS_PROTO_ARRAYDATA_POOL.get(key);
    if (!CLASS_PROTO_ARRAYDATA) {
      return;
    }
    do {
      if (!target.hasOwnProperty(this.PA_ID_KEY)) {
        break;
      }
      const pa_id = target[this.PA_ID_KEY];
      const arr_data = CLASS_PROTO_ARRAYDATA.get(pa_id);
      if (!arr_data) {
        return;
      }
      const index = arr_data.indexOf(value);
      if (index !== -1) {
        arr_data.splice(index, 1);
        return;
      }
    } while ((target = Object.getPrototypeOf(target)));
  }
}
