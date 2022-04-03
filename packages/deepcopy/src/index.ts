import { detectType } from "./detector";
import { get, isCollection, set } from "./collection";
import { copy } from "./copier";

/**
 * deepcopy function
 *
 * @param {*} value
 * @param {Object|Function} [options]
 * @return {*}
 */
export function deepCopy<V>(value: V, options: { customizer?: Function } = {}) {
  if (typeof options === "function") {
    options = {
      customizer: options,
    };
  }

  const {
    // TODO: before/after customizer
    customizer,
    // TODO: max depth
    // depth = Infinity,
  } = options;

  const valueType = detectType(value);

  if (!isCollection(valueType)) {
    return copy(value, valueType);
  }

  const copiedValue = copy(value, valueType, customizer);

  const references = new WeakMap([[value as unknown as object, copiedValue]]);
  const visited = new WeakSet([value as unknown as object]);

  return recursiveCopy(value, copiedValue, references, visited, customizer);
}

/**
 * recursively copy
 *
 * @param {*} value target value
 * @param {*} clone clone of value
 * @param {WeakMap} references visited references of clone
 * @param {WeakSet} visited visited references of value
 * @param {Function} customizer user customize function
 * @return {*}
 */
function recursiveCopy<V>(
  value: V,
  clone: any,
  references: WeakMap<object, unknown>,
  visited: WeakSet<object>,
  customizer?: Function,
): V {
  const type = detectType(value);
  const copiedValue = copy(value, type);

  // return if not a collection value
  if (!isCollection(type)) {
    return copiedValue;
  }

  let keys: Iterable<string | symbol> | undefined;

  switch (type) {
    case "Arguments":
    case "Array":
      keys = Object.keys(value);
      break;
    case "Object":
      keys = (Object.keys(value) as (string | symbol)[]).concat(
        Object.getOwnPropertySymbols(value),
      );
      break;
    case "Map":
    case "Set":
      keys = (value as unknown as Map<any, any> | Set<any>).keys();
      break;
    default:
  }

  // walk within collection with iterator
  if (keys) {
    for (const collectionKey of keys) {
      const collectionValue = get<object>(value as any, collectionKey, type);

      if (visited.has(collectionValue)) {
        // for [Circular]
        set(clone, collectionKey, references.get(collectionValue), type);
      } else {
        const collectionValueType = detectType(collectionValue);
        const copiedCollectionValue = copy(collectionValue, collectionValueType, customizer);

        // save reference if value is collection
        if (isCollection(collectionValueType)) {
          references.set(collectionValue, copiedCollectionValue);
          visited.add(collectionValue);
        }

        if (copiedCollectionValue)
          set(
            clone,
            collectionKey,
            Object.isFrozen(copiedCollectionValue)
              ? copiedCollectionValue
              : recursiveCopy(
                  collectionValue,
                  copiedCollectionValue,
                  references,
                  visited,
                  customizer,
                ),
            type,
          );
      }
    }
  }

  // TODO: isSealed/isFrozen/isExtensible

  return clone;
}
