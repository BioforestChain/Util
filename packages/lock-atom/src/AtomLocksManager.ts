let uuid_accer = 0;
/* 基于callback风格的锁，兼容Promise，性能比Promise好 */
export class AtomLock<
  K extends BFChainUtil.Lock.AtomLockKey = BFChainUtil.Lock.TransferableAtomLockKey,
> {
  readonly uid = uuid_accer++ % 4294967296;
  // uuid = `${process_name}(${process.pid})-${uuid_accer++}`
  constructor(public key: K) {}
  is_finished = false;
  private _cbs: Function[] = [];
  then(cb: Function) {
    if (this.is_finished) {
      try {
        cb();
      } catch (err) {}
      return;
    }
    this._cbs.push(cb);
  }
  after_unlock?: () => any;
  unlock() {
    if (this.is_finished) {
      return;
    }
    this.is_finished = true;
    for (const cb of this._cbs) {
      try {
        cb();
      } catch (err) {}
    }
    this._cbs.length = 0;
    this.after_unlock && this.after_unlock();
  }
}
export function isAtomLockKey(key: unknown): key is BFChainUtil.Lock.AtomLockKey {
  const type = typeof key;
  return type === "number" || type === "string";
}

export class AtomLocksRef<
  K extends BFChainUtil.Lock.AtomLockKey = BFChainUtil.Lock.TransferableAtomLockKey,
> {
  uid = uuid_accer++ % 4294967296;
  public cur_index: Map<number, AtomLock<K>>;
  public pre_index: Map<number, AtomLock<K>>;
  /* 指定某一个 */
  constructor(
    public cur_job_map: Map<K, AtomLock<K>>,
    public pre_job_map: Map<K, AtomLock<K>>,
    /* 当前锁的下标索引 */
    cur_index?: Map<number, AtomLock<K>>,
    pre_index?: Map<number, AtomLock<K>>,
  ) {
    if (!cur_index) {
      cur_index = new Map<number, AtomLock<K>>();
      let i = 0;
      for (const atomLock of cur_job_map.values()) {
        cur_index.set(i, atomLock);
        i += 1;
      }
    }
    this.cur_index = cur_index;
    if (!pre_index) {
      pre_index = new Map<number, AtomLock<K>>();
      let i = 0;
      for (const atomLock of pre_job_map.values()) {
        pre_index.set(i, atomLock);
        i += 1;
      }
    }
    this.pre_index = pre_index;
  }
  finish(ids: Iterable<K> | K) {
    const { cur_job_map } = this;
    if (typeof ids === "object" && Symbol.iterator in ids) {
      for (const id of ids as Iterable<K>) {
        const job = cur_job_map.get(id);
        if (job) {
          job.unlock();
        }
      }
    } else {
      const job = cur_job_map.get(ids as K);
      if (job) {
        job.unlock();
      }
    }
  }
  finishAll() {
    for (const cur_lock of this.cur_job_map.values()) {
      cur_lock.unlock();
    }
  }
  async getPreJobsDone() {
    for (const pre_lock of this.pre_job_map.values()) {
      if (!pre_lock.is_finished) {
        await (pre_lock as any); // 因为有.then属性，强行当成Promise对象来用
      }
    }
  }
  async getJobsDone() {
    for (const cur_lock of this.cur_job_map.values()) {
      if (!cur_lock.is_finished) {
        await (cur_lock as any); // 因为有.then属性，强行当成Promise对象来用
      }
    }
  }
}

const ATOMLOCKSET_LAST_LOCK = new WeakMap<Set<AtomLock<any>>, AtomLock<any>>();

export class AtomLocksManager<
  K extends BFChainUtil.Lock.AtomLockKey = BFChainUtil.Lock.TransferableAtomLockKey,
> {
  private _map = new Map<
    K,
    /* 这里使用Set而不是Array，一个是方便移除，一个是Set的存储顺序也是我们插入的顺序，与Array类似，而我们不完全需要Array的下标索引 */
    Set<AtomLock<K>>
  >();
  constructor() {}
  static isLockKey(id: unknown) {
    const id_type = typeof id;
    return id_type === "string" || id_type === "number" || id_type === "symbol";
  }
  appendLocksWithDetail(ids: Iterable<K>) {
    /* 迭代器的最大上限为uint16:65536个元素，溢出会导致异常 */
    // debug('appendLocks', ids);
    const pre_locks_map = new Map<K, AtomLock<K>>();
    const cur_locks_map = new Map<K, AtomLock<K>>();
    /* 方便快速用下标定位一个atomLock */
    const cur_locks_index_map = new Map<number, AtomLock<K>>();
    const pre_locks_index_map = new Map<number, AtomLock<K>>();
    const pre_lock_index_list: number[] = [];
    let is_over_uint8 = false;
    let is_over_uint16 = false;
    let i = 0;
    // 注意：和旧版的API不一样的是，这里不做去重了，而是在入口那边进行去重，毕竟是用于进程之间通讯，为了避免不必要的数据传输，应该在传输前就完成去重。
    for (const id of ids) {
      // 获取锁的队列
      const locks = this._map.get(id) || new Set<AtomLock<K>>();
      // debug('has', id, [...locks.values()].map(l => l.uid));
      if (locks.size === 0) {
        this._map.set(id, locks);
      } else {
        // 获取前锁放入前锁队列
        const pre_lock = ATOMLOCKSET_LAST_LOCK.get(locks) as AtomLock<K>;
        pre_locks_map.set(id, pre_lock);
        pre_locks_index_map.set(pre_locks_index_map.size, pre_lock);
        pre_lock_index_list.push(i);
      }
      // 生成新锁
      const new_lock = new AtomLock<K>(id);
      new_lock.after_unlock = () => {
        locks.delete(new_lock);
        if (locks.size === 0) {
          this._map.delete(id);
          ATOMLOCKSET_LAST_LOCK.delete(locks);
        }
      };

      // 将新锁放入集合中与当前锁队列中
      // debug("new", id, new_lock.uid);
      locks.add(new_lock);
      // 注册自动删除事件
      new_lock.after_unlock = () => {
        locks.delete(new_lock);
        // debug(new_lock.id, '完成', [...locks.values()].map(l => l.uid));
        if (locks.size === 0) {
          this._map.delete(id);
        }
      };

      ATOMLOCKSET_LAST_LOCK.set(locks, new_lock);
      cur_locks_map.set(id, new_lock);
      cur_locks_index_map.set(i, new_lock);
      i += 1;
      if (i === 256) {
        // > 255
        console.warn("Too many locks at once, please divide the task reasonably.");
        is_over_uint8 = true;
      }
      if (i === 65536) {
        // > 65535
        console.warn("Too many locks at once, please divide the task reasonably.");
        is_over_uint16 = true;
      }
    }
    return {
      locksRef: new AtomLocksRef(cur_locks_map, pre_locks_map, cur_locks_index_map),
      pre_lock_index_list,
      is_over_uint8,
      is_over_uint16,
    };
  }
  appendLocks(ids: Iterable<K>) {
    return this.appendLocksWithDetail(ids).locksRef;
  }
  getLocks(ids: K[]) {
    const pre_locks_map = new Map<K, AtomLock<K>>();
    for (const id of ids) {
      const locks = this._map.get(id);
      if (locks) {
        const pre_lock = ATOMLOCKSET_LAST_LOCK.get(locks) as AtomLock<K>;
        pre_locks_map.set(id, pre_lock);
      }
    }
    return new AtomLocksRef(pre_locks_map, new Map());
  }
}
