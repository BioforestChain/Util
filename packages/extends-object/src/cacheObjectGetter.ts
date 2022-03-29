const SYM = Symbol("cog");
export function cacheObjectGetter<O extends {}>(obj: O) {
  for (const [key, dep] of Object.entries(Object.getOwnPropertyDescriptors(obj))) {
    const sourceGet = dep.get;
    if (sourceGet && !(sourceGet as any)[SYM]) {
      dep.get = () => {
        const res = sourceGet();
        Object.defineProperty(obj, key, { value: res });
        return res;
      };
      (dep.get as any)[SYM] = true;
      Object.defineProperty(obj, key, dep);
    }
  }
  return obj;
}
