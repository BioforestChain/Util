export type $SafeThendCache<T> = {
  cbs?: {
    resolves: Set<(value: T) => unknown>;
    rejects: Set<(reason: any) => unknown>;
  };
  promise: PromiseLike<unknown>;
  // isFinished: boolean;
};
export type $PromiseRaceOptions = {
  throwWhenNoRacer: boolean;
};
