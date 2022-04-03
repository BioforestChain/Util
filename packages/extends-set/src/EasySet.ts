import { cacheGetter } from "@bfchain/util-decorator";

export class EasySet<K, F = K> {
  private _set: Set<F>;
  constructor(
    entries?: Iterable<F> | null,
    public transformKey: (key: K) => F = (v) => v as unknown as F,
    private readonly _afterDelete?: (key: F) => unknown,
  ) {
    this._set = new Set(entries);
  }
  static from<K, F = K>(args: {
    entries?: Iterable<F> | null;
    transformKey?: (key: K) => F;
    afterDelete?: (key: F) => unknown;
  }) {
    return new EasySet(args.entries, args.transformKey, args.afterDelete);
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
  get clear() {
    return this._set.clear.bind(this._set);
  }
  @cacheGetter
  get delete() {
    const deleteHanlder = this._set.delete.bind(this._set);
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
  get forEach() {
    return this._set.forEach.bind(this._set);
  }
  @cacheGetter
  get has() {
    return this._set.has.bind(this._set);
  }
  @cacheGetter
  get add() {
    return this._set.add.bind(this._set);
  }
  get size() {
    return this._set.size;
  }
  /** Returns an iterable of entries in the set. */
  @cacheGetter
  get [Symbol.iterator]() {
    return this._set[Symbol.iterator].bind(this._set);
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the set.
   */
  @cacheGetter
  get entries() {
    return this._set.entries.bind(this._set);
  }

  /**
   * Returns an iterable of keys in the set
   */
  @cacheGetter
  get keys() {
    return this._set.keys.bind(this._set);
  }

  /**
   * Returns an iterable of values in the set
   */
  @cacheGetter
  get values() {
    return this._set.values.bind(this._set);
  }
  get [Symbol.toStringTag]() {
    return "EasySet";
  }
}
