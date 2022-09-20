/**任务收集器
 * ```
 * const tl = new TaskList();
 * tl.next = sleep(1)
 * tl.next = sleep(2)
 * await tl.toPromise();
 * ```
 */
export class TaskList<T = any> {
  private _task_list: (Promise<T> | T)[] = [];
  toPromise() {
    return Promise.all(this._task_list);
  }
  set next(task: Promise<T> | T) {
    this._task_list.push(task);
  }
  /**
   * @deprecated
   */
  tryToPromise() {
    if (this._task_list.some((task) => task && typeof (task as any).then === "function")) {
      return Promise.all(this._task_list);
    }
    return this._task_list;
  }
}

export const wrapTaskList = async <T = any>(cb: (taskList: TaskList<T>) => unknown) => {
  const taskList = new TaskList();
  try {
    await cb(taskList);
  } catch (err) {
    taskList.next = Promise.reject(err);
  }
  return taskList.toPromise();
};
