// import { cacheGetter } from "@bfchain/util-decorator";

type TREE = { [key: string]: TREE };
export class BinaryTreeMap<
  V,
  K extends { [index: number]: number } = { [index: number]: number }
> implements Map<K, V>
{
  private _tree: TREE = {};
  clear(): void {
    throw new Error("Method not implemented.");
  }
  delete(key: K): boolean {
    throw new Error("Method not implemented.");
  }
  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any
  ): void {
    throw new Error("Method not implemented.");
  }
  get(key: K): V | undefined {
    throw new Error("Method not implemented.");
  }
  has(key: K): boolean {
    throw new Error("Method not implemented.");
  }
  set(key: K, value: V): this {
    throw new Error("Method not implemented.");
    this._tree;
  }
  size!: number;
  [Symbol.iterator](): IterableIterator<[K, V]> {
    throw new Error("Method not implemented.");
  }
  entries(): IterableIterator<[K, V]> {
    throw new Error("Method not implemented.");
  }
  keys(): IterableIterator<K> {
    throw new Error("Method not implemented.");
  }
  values(): IterableIterator<V> {
    throw new Error("Method not implemented.");
  }
  [Symbol.toStringTag]!: string;
}
