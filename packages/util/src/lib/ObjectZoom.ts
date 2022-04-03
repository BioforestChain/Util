type objValue = string | number | boolean | bigint;
export class ObjectZoom<T extends { [key: string]: objValue }> {
  constructor(private _sort?: string[], private useindex?: Map<string, string[]>) {
    if (useindex) {
      //   this.indexs_1_keyzoom = new ObjectZoom(["a", "b"]);
      useindex.forEach((index_keys, indexname) => {
        this.indexs.set(indexname, {
          keyzoom: new ObjectZoom(index_keys),
          valueRef: new Map(),
        });
      });
    }
  }
  keysMaps = new Map<string, Map<objValue, { [key: string]: objValue }>>();
  indexs = new Map<string, { keyzoom: ObjectZoom<any>; valueRef: Map<any, Set<T>> }>();

  fromObject(obj: T) {
    let res: T = null as any;
    if (!this._sort) {
      this._sort = Object.keys(obj);
    }
    let is_new_item = false;
    for (const key of this._sort) {
      let keyMap = this.keysMaps.get(key);
      if (!keyMap) {
        keyMap = new Map();
        this.keysMaps.set(key, keyMap);
      }
      const value = obj[key];
      //   console.log(key, value);
      const kres = keyMap.get(value);
      if (!kres) {
        is_new_item = true;
        res = Object.create(res);

        (res as any)[key] = value;
        keyMap.set(value, res);
      } else {
        res = kres as any;
      }
    }
    /// 保存索引
    if (is_new_item) {
      this.indexs.forEach((index) => {
        const indexKey = index.keyzoom.fromObject(res);
        let indexVal = index.valueRef.get(indexKey);
        if (!indexVal) {
          indexVal = new Set();
          index.valueRef.set(indexKey, indexVal);
        }
        indexVal.add(res);
      });
    }
    return res as T;
  }
}

// // const delegateObj = Object.create(null);
// // delegateObj.delegate = "delegate 1 address";
// // const delegateMap = new Map([[delegateObj.delegate, delegateObj]]);

// // const dappIdObj = Object.create(delegateObj);
// // dappIdObj.dappId = "myDappid";
// // const dappIdMap = new Map([[dappIdObj.dappId, dappIdObj]]);

// // const senderIdObj = Object.create(dappIdObj);
// // senderIdObj.senderId = "senderIdwzx";
// // const senderIdMap = new Map([[senderIdObj.senderId, senderIdObj]]);

// // const roundObj = Object.create(senderIdObj);
// // roundObj.round = 123;
// // const roundMap = new Map([[roundObj.round, roundObj]]);

// // console.log(JSON.stringify(roundObj,null,2));

// type VOTES = string[];
// const memVoteMemory = new Map<MyZOOM_OBJ, VOTES>();

// let votes = memVoteMemory.get(zobj_2);
// if (!votes) {
//   votes = [];
//   memVoteMemory.set(zobj_2, votes);
// }
// votes.push(Math.random().toString(16));

// console.log(memVoteMemory.get(zobj_2));
