import { sleep, unsleep } from "@bfchain/util-extends-promise";
import { isPromiseLike } from "@bfchain/util-extends-promise-is";
const durationToPromise = <T>(duration: $Duration<T>, value: T) => {
  if (typeof duration === "number") {
    return sleep(duration);
  }
  const d = duration(value);
  if (typeof d === "number") {
    return sleep(d);
  }
  if (isPromiseLike(d)) {
    return d;
  }
  return Promise.resolve(d);
};
type $Duration<T> = number | ((value: T) => number | Promise<unknown>);

export const time = <T>(
  config: {
    throttle?: {
      duration: $Duration<T>;
      leading?: boolean;
      trailing?: boolean;
    };
    debounce?: {
      duration: $Duration<T>;
      onDebunce?: (timer: Promise<unknown>) => unknown;
    };
  } = {},
) => {
  const {
    duration: throttleDuration,
    leading = true,
    trailing = false,
  } = config.throttle ?? { duration: 0, leading: false, trailing: false };

  const { duration: debounceDuration, onDebunce } = config.debounce ?? { duration: 0 };

  let leadingEndTime: undefined | Promise<unknown>;
  let trailingStartTime: undefined | { po: Promise<unknown>; va: T; i: number };
  let debounceTimmer: Promise<unknown>;

  let latestEnqueueIndex = -1;
  const enqueue = (controller: TransformStreamDefaultController<T>, chunk: T, index: number) => {
    if (index <= latestEnqueueIndex) {
      return;
    }
    latestEnqueueIndex = index;
    controller.enqueue(chunk);
  };
  let chunkIndex = -1;

  return new TransformStream<T, T>({
    transform(chunk, controller) {
      const index = chunkIndex++;
      if (leading) {
        if (leadingEndTime === undefined) {
          enqueue(controller, chunk, index);
          leadingEndTime = durationToPromise(throttleDuration, chunk).then(
            () => (leadingEndTime = undefined),
            controller.error,
          );
          return;
        }
      }

      if (trailing) {
        if (trailingStartTime === undefined) {
          const tst = (trailingStartTime = {
            po: durationToPromise(throttleDuration, chunk).then(() => {
              enqueue(controller, tst.va, tst.i);
              trailingStartTime = undefined;
            }, controller.error),
            va: chunk,
            i: index,
          });
        } else {
          trailingStartTime.va = chunk;
          trailingStartTime.i = index;
        }
      }

      if (debounceDuration > 0) {
        if (debounceTimmer !== undefined) {
          unsleep(debounceTimmer);
          onDebunce?.(debounceTimmer);
        }
        debounceTimmer = durationToPromise(debounceDuration, chunk).then(() => {
          enqueue(controller, chunk, index);
        }, controller.error);
      }
    },
  });
};
