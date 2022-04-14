import { PromiseOut } from "@bfchain/util-extends-promise-out";

interface Sub {
  start: number;
  end: number;
  changed: boolean | PromiseOut<void>;
}

const ABORT_SIGNAL = Symbol("abort-signal");
export class ReactiveArray<T> extends Array<T> {
  constructor() {
    super();
  }

  emitChanged(start: number, count: number = 1) {
    if (this._subs === undefined) {
      return;
    }
    const end = start + count;
    for (const sub of this._subs) {
      if (sub.changed === true) {
        continue;
      }
      if (false === (start > sub.end || end < sub.start)) {
        if (sub.changed instanceof PromiseOut) {
          sub.changed.resolve();
        }
        sub.changed = true;
      }
    }
  }
  private _subs?: Set<Sub>;

  async *_subscription(sub: Sub) {
    if (this._subs === undefined) {
      this._subs = new Set();
    }
    this._subs.add(sub);
    try {
      do {
        if (sub.changed === true) {
          sub.changed = false;
          yield this.slice(sub.start, sub.end);
        }
        if (sub.changed === false) {
          sub.changed = new PromiseOut();
          await sub.changed.promise;
          sub.changed = true;
        }
      } while (true);
    } catch (err) {
      if (err !== ABORT_SIGNAL) {
        throw err;
      }
    } finally {
      this._subs.delete(sub);
    }
  }
  subscription(start: number = 0, end: number = Infinity, takeCurrent = true) {
    const sub: Sub = { start, end, changed: takeCurrent };
    const subject = this._subscription(sub);
    const _return = subject.return;
    /// 重写 return 函数，确保能够直接地释放掉这个订阅
    subject.return = (arg: any) => {
      if (sub.changed instanceof PromiseOut) {
        sub.changed.reject(ABORT_SIGNAL);
      }
      return _return.call(subject, arg);
    };
    return subject;
  }

  push(...args: T[]) {
    if (args.length > 0) {
      this.emitChanged(this.length, args.length);
    }
    return super.push(...args);
  }
  pop() {
    if (this.length > 0) {
      this.emitChanged(this.length - 1, 1);
    }
    return super.pop();
  }

  unshift(...args: T[]) {
    if (args.length > 0) {
      this.emitChanged(0, this.length + args.length);
    }
    return super.unshift(...args);
  }
  shift() {
    if (this.length > 0) {
      this.emitChanged(0, this.length);
    }
    return super.shift();
  }

  splice(start: number = 0, deleteCount: number = 0, ...items: T[]): T[] {
    if (Number.isFinite(start) === false) {
      start = 0;
    }
    if (start < 0) {
      start = (start % this.length) + this.length;
    }
    if (Number.isFinite(deleteCount) === false || deleteCount < 0) {
      deleteCount = 0;
    }
    /// deleteCount > 0 || items.length > 0
    if (deleteCount + items.length > 0) {
      /// 已经影响到数组后面的所有元素
      if (deleteCount !== items.length) {
        this.emitChanged(start, Math.max(start + deleteCount, start + items.length));
      }
      /// 只影响到被删除的几个元素
      else {
        this.emitChanged(start, items.length);
      }
    }
    return super.splice(start, deleteCount, ...items);
  }
}
