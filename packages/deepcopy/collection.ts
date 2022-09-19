import { detectType } from "./detector.ts";

/**
 * collection types
 */
const collectionTypeSet = new Set(["Arguments", "Array", "Map", "Object", "Set"]);

const COLLECTION = new (class {
  /**
   * get value from collection
   *
   * @param {Array|Object|Map|Set} collection
   * @param {string|number|symbol} key
   * @param {string} [type=null]
   * @return {*}
   */
  get<V = unknown>(collection: V[], key: number, type?: string): V;
  get<V = unknown>(collection: { [key in any]: V }, key: any, type?: string): V;
  get<V = unknown>(collection: Map<any, V>, key: any, type?: string): V;
  get<V = unknown>(collection: Set<V>, key: V, type?: string): V;
  get(collection: unknown, key: unknown, type?: string): void;
  get<V>(collection: any, key: any, valueType = detectType(collection)): V | undefined {
    switch (valueType) {
      case "Arguments":
      case "Array":
      case "Object":
        return collection[key];
      case "Map":
        return collection.get(key);
      case "Set":
        // NOTE: Set.prototype.keys is alias of Set.prototype.values
        // it means key is equals value
        return key as V;
      default:
    }
  }
  /**
   * set value to collection
   *
   * @param {Array|Object|Map|Set} collection
   * @param {string|number|symbol} key
   * @param {*} value
   * @param {string} [valueType=null]
   * @return {Array|Object|Map|Set}
   */
  set<C extends V[], V = unknown>(collection: C, key: number, value: V, type?: string): C;
  set<C extends { [key in any]: V }, V = unknown>(
    collection: C,
    key: any,
    value: V,
    type?: string,
  ): C;
  set<C extends Map<any, V>, V = unknown>(collection: C, key: any, value: V, type?: string): C;
  set<C extends Set<V>, V = unknown>(collection: C, key: V, value: V, type?: string): C;
  set<C>(collection: C, key: unknown, type?: string): C;
  set<C extends V[] | { [key in any]: V } | Map<unknown, V> | Set<V>, V = unknown>(
    collection: C,
    key: unknown,
    value: V,
    valueType = detectType(collection),
  ): C {
    switch (valueType) {
      case "Arguments":
      case "Array":
      case "Object":
        (collection as any)[key as any] = value;
        break;
      case "Map":
        (collection as Map<unknown, V>).set(key, value);
        break;
      case "Set":
        (collection as Set<V>).add(value);
        break;
      default:
    }

    return collection;
  }
})();

export const get = COLLECTION.get;
export const set = COLLECTION.set;

/**
 * check to type string is collection
 *
 * @param {string} type
 */
export function isCollection(type: string) {
  return collectionTypeSet.has(type);
}
