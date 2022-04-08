declare namespace BFChainUtil {
  type ReactiveStream<T = unknown> = import("./ReactiveStream").ReactiveStream<T>;
  namespace ReactiveStream {
    type Map<I = unknown, O = unknown> = (event: Map.Event<I>) => O;
    namespace Map {
      type Event<T> = {
        data: T;
        index: number;
        statement: LoopStatement | undefined;
        target: ReactiveStream<T>;
      };
      type LoopStatement = "continue" | "break" | "return";
    }

    type Filter<I = unknown, O extends I = I> =
      | ((item: I, index: number, ctx: ReactiveStream<I>) => BFChainUtil.PromiseMaybe<boolean>)
      | ((item: I, index: number, ctx: ReactiveStream<I>) => item is O);
    namespace Filter {
      type GetInput<F> = F extends Filter<infer Input, infer _> ? Input : never;
      type GetOutput<F> = F extends Filter<infer _, infer Output> ? Output : never;
      type ToMap<F> = F extends Filter<infer I, infer O> ? Map<I, O> : never;
    }

    type Controller = {
      // cancel?: UnderlyingSourceCancelCallback;
      // pull?: UnderlyingSourcePullCallback<R>;
      // start?: UnderlyingSourceStartCallback<R>;
      // type?: undefined;
    };
  }
}
