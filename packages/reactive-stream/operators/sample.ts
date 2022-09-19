export const sample = <T>(notifier: AsyncIterator<unknown>) => {
  const currentSample = [] as T[];
  return new TransformStream<T>({
    start: async (controller) => {
      do {
        await notifier.next();
        if (currentSample.length !== 0) {
          controller.enqueue(currentSample.shift() as T);
        }
      } while (true);
    },
    transform: (chunk) => {
      currentSample[0] = chunk;
    },
  });
};
