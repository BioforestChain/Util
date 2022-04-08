export const slice = <T>(start: number, end: number = Infinity) => {
  if (Number.isFinite(start) === false) {
    start = 0;
  }

  if (Number.isFinite(end) === false) {
    end = Infinity;
  }

  if (start >= 0) {
    let i = 0;
    return new TransformStream<T>({
      transform(chunk, controller) {
        const index = i++;
        if (index >= start && index < end) {
          controller.enqueue(chunk);
        }
      },
    });
  }
  /// start 为负数的时候，只能等到流结束了才能知道末尾在哪里
  else {
    const chunkList: T[] = [];
    return new TransformStream<T>({
      transform(chunk, controller) {
        chunkList.push(chunk);
      },
      flush(controller) {
        for (const item of chunkList.slice(start, end)) {
          controller.enqueue(item);
        }
      },
    });
  }
};
