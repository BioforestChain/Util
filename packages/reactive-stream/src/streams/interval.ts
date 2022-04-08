export const throttleTime = (time: number, immediately = false) => {
  let ti: any;
  let count = 0;
  return new ReadableStream<number>({
    start(ctrl) {
      if (immediately) {
        ctrl.enqueue(count++);
      }
      ti = setInterval(() => {
        ctrl.enqueue(count++);
      }, time);
    },
    cancel() {
      clearImmediate(ti);
    },
  });
};

// const z = throttleTime(100);
// z.pipeThrough
// new TransformStream