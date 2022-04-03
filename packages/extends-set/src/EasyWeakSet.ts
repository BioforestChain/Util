import { cacheGetter } from "@bfchain/util-decorator";

export class EasyWeakSet<K extends object, F extends object = K> {
  private _ws: WeakSet<F>;
  constructor(
    entries?: ReadonlyArray<F> | null,
    public transformKey: (key: K) => F = (v) => v as unknown as F,
    private readonly _afterDelete?: (key: F) => unknown,
  ) {
    this._ws = new WeakSet(entries);
  }

  static from<K extends object, F extends object = K>(args: {
    entries?: ReadonlyArray<F> | null;
    transformKey?: (key: K) => F;
    afterDelete?: (key: F) => unknown;
  }) {
    return new EasyWeakSet(args.entries, args.transformKey, args.afterDelete);
  }

  tryAdd(key: K) {
    return this.add(this.transformKey(key));
  }
  tryDelete(key: K) {
    return this.delete(this.transformKey(key));
  }
  tryHas(key: K) {
    return this.has(this.transformKey(key));
  }

  @cacheGetter
  get delete() {
    const deleteHanlder = this._ws.delete.bind(this._ws);
    const { _afterDelete } = this;
    if (_afterDelete) {
      return (key: F) => {
        if (deleteHanlder(key)) {
          _afterDelete(key);
          return true;
        }
        return false;
      };
    }
    return deleteHanlder;
  }

  @cacheGetter
  get add() {
    return this._ws.add.bind(this._ws);
  }
  @cacheGetter
  get has() {
    return this._ws.has.bind(this._ws);
  }

  get [Symbol.toStringTag]() {
    return "EasyWeakSet";
  }
}
