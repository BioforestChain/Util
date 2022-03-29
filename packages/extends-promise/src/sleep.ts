const SLEEP_TASK_TI_WM = new WeakMap<Promise<unknown>, any>();
export const sleep = <R>(ms: number, onresolve?: () => R | PromiseLike<R>) => {
  let ti: unknown;
  if (ms <= 0) {
    ms = 1;
  }

  const task = new Promise<void>(
    (resolve) =>
      (ti = setTimeout(() => {
        SLEEP_TASK_TI_WM.delete(task);
        resolve();
      }, ms)),
  ).then(onresolve);
  SLEEP_TASK_TI_WM.set(task, ti);
  return task;
};
export const unsleep = (task: ReturnType<typeof sleep>) => {
  const ti = SLEEP_TASK_TI_WM.get(task);
  if (ti !== undefined) {
    SLEEP_TASK_TI_WM.delete(task);
    clearTimeout(ti);
  }
};
