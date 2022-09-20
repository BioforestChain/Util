import { $PromiseMaybe } from "../typings/$types.ts";
import { ReactiveStream } from "./ReactiveStream.ts";
export type $ReactiveStream<T = unknown> = ReactiveStream<T>;

export namespace $ReactiveStream {
  export type Map<I = unknown, O = unknown> = (event: Map.Event<I>) => O;

  export namespace Map {
    export type Event<T> = {
      data: T;
      index: number;
      statement: LoopStatement | undefined;
      target: $ReactiveStream<T>;
    };
    export type LoopStatement = "continue" | "break" | "return";
  }

  export type Filter<I = unknown, O extends I = I> =
    | ((
        item: I,
        index: number,
        ctx: $ReactiveStream<I>
      ) => $PromiseMaybe<boolean>)
    | ((item: I, index: number, ctx: $ReactiveStream<I>) => item is O);

  export namespace Filter {
    export type GetInput<F> = F extends Filter<infer Input, infer _>
      ? Input
      : never;
    export type GetOutput<F> = F extends Filter<infer _, infer Output>
      ? Output
      : never;
    export type ToMap<F> = F extends Filter<infer I, infer O>
      ? Map<I, O>
      : never;
  }

  // deno-lint-ignore ban-types
  export type $Controller = {
    // cancel?: UnderlyingSourceCancelCallback;
    // pull?: UnderlyingSourcePullCallback<R>;
    // start?: UnderlyingSourceStartCallback<R>;
    // type?: undefined;
  };

  export type GetType<RS> = RS extends ReactiveStream<infer T> ? T : never;
}
