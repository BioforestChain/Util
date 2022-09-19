export const distinct = <T, K = T>(keySelector?: (item: T, index: number, set: Set<K>) => K) => {
  const set = new Set<K>();

  let index = 0;
  return new TransformStream<T>({
    transform: (chunk, controller) => {
      const key = (keySelector ? keySelector(chunk, index++, set) : chunk) as K;
      if (set.has(key)) {
        return;
      }
      set.add(key);
      controller.enqueue(key);
    },
  });
};
