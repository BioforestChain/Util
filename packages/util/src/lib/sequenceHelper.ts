import { EventEmitter } from "@bfchain/util-event";
import { PromiseOut } from "@bfchain/util-extends-promise-out";
import { ignoreAwait } from "@bfchain/util-typings";

type TaskModel = {
  func: Function;
  promiseOut: PromiseOut<any>;
  args: any;
};
export class SequenceHelper extends EventEmitter<{
  doJob: [];
}> {
  constructor() {
    super();
    this.on("doJob", () => {
      ignoreAwait(this.__doJob());
    });
  }
  private __tasks: TaskModel[] = [];
  private __results: PromiseOut<any>[] = [];
  private __isDoingJob = false;

  execTask<T = any>(task: Function, ...args: any[]) {
    const job = { func: task, args, promiseOut: new PromiseOut<T>() };
    this.__tasks.push(job);
    this.__results.push(job.promiseOut);
    this.emit("doJob");
    return job.promiseOut.promise;
  }

  execTaskWithoutPushResult<T = any>(task: Function, ...args: any[]) {
    const job = { func: task, args, promiseOut: new PromiseOut<T>() };
    this.__tasks.push(job);
    this.emit("doJob");
    return job.promiseOut.promise;
  }

  private async __doJob() {
    if (!this.__isDoingJob) {
      this.__isDoingJob = true;
      do {
        const job = this.__tasks.shift();
        if (job) {
          let r: any;
          try {
            r = await job.func(...job.args);
            job.promiseOut.resolve(r);
          } catch (error) {
            job.promiseOut.reject(error);
          }
        } else {
          break;
        }
      } while (true);
      this.__isDoingJob = false;
    } else {
      return;
    }
  }

  async doAll() {
    const r = await Promise.all(this.__results.map((v) => v.promise));
    this.__results = [];
    return r;
  }

  /**
   * 清空队列
   *
   */
  clearQueue() {
    this.__tasks = [];
    this.__results = [];
  }
}
