import { $ReactiveStream } from "./$types.ts";

export class ReactiveStream<T> /* implements AsyncIterableIterator<T>  */ {
  constructor(private _src: AsyncIterableIterator<T>) {}

  //   next = this._src.next.bind(this._src);
  //   return = this._src.return?.bind(this._src);
  //   throw = this._src.throw?.bind(this._src);
  //   [Symbol.asyncIterator] = this._src[Symbol.asyncIterator].bind(this._src);

  async *filter<R extends T = T>(filter: $ReactiveStream.Filter<T, R>) {
    let index = 0;
    for await (const item of this._src) {
      if (await filter(item, index++, this)) {
        yield item as unknown as R;
      }
    }
  }
  async *map<R>(map: $ReactiveStream.Map<T, R>) {
    let index = 0;
    loop: for await (const item of this._src) {
      const event: $ReactiveStream.Map.Event<T> = {
        data: item,
        index: index++,
        statement: undefined,
        target: this,
      };
      const r = await map(event);
      switch (event.statement) {
        case "continue":
          continue loop;
        case "break":
          break loop;
        case "return":
          yield r;
          return;
        default:
          yield r;
      }
    }
  }
  // createPiper<P extends Piper<T>>(Piper: new () => P): P {
  //   return new Piper() as unknown as P;
  // }
  //   // pipe<PS extends $PipeHanlder<T, unknown>[]>(...pipes: PS) {}

  //   private async *_pipe<R>(hanlder: $PipeHanlder<T, R>) {
  //     let index = 0;
  //     for await (const item of this._src) {
  //       const r = await hanlder(item, index, FOR_CONTROLLER);
  //       if (r === continue_symbol) {
  //         continue;
  //       } else if (r === break_symbol) {
  //         break;
  //       }
  //       yield r;
  //     }
  //   }
  //   pipe<R>(hanlder: $PipeHanlder<T, R>) {
  //     return new ReactiveStream(this._pipe(hanlder));
  //   }
  tee() {
    return new ReactiveStream(this._src);
  }
}

// export class ReactiveStream2<T> {
//   constructor(args: { start: controller }) {
//     new ReadableStream({});
//   }
//   readonly locked = false;
//   async *getIterator() {}
//   async getReader() {}
//   [Symbol.asyncIterator]() {
//     return this.getIterator();
//   }
// }

// class ReactiveStreamCreater<T> {
//   constructor(private _src: AsyncIterableIterator<T>) {}
//   private _transfroms: $PipeHanlder<any, any>[] = [];
//   addTransfer<R>(pipe: $PipeHanlder<T, R>) {
//     this._transfroms.push(pipe);
//     return this as unknown as ReactiveStreamCreater<R>;
//   }
//   private async *_toAi() {
//     let index = 0;
//     stream: for await (const item of this._src) {
//       let input: any = item;
//       for (const transfrom of this._transfroms) {
//         const output = transfrom(input, index, FOR_CONTROLLER, this);
//         if (output === continue_symbol) {
//           continue stream;
//         } else if (output === break_symbol) {
//           break stream;
//         }
//         input = output;
//       }
//       yield input as T;
//     }
//   }
//   toStream() {
//     return new ReactiveStream(this._toAi());
//   }
// }

// interface Piper<INPUT> {
//   map<R>(
//     item: INPUT,
//     index: number,
//     ctrl: typeof FOR_CONTROLLER,
//   ): R | $PromiseMaybe<$ForController>;
// }

const continue_symbol = Symbol("continue");
const break_symbol = Symbol("break");

export const FOR_CONTROLLER = Object.freeze({
  continue: continue_symbol,
  break: break_symbol,
} as const);
// export type $ForController = typeof FOR_CONTROLLER[keyof typeof FOR_CONTROLLER];
// export type $PipeHanlder<I, O> = (
//   item: I,
//   index: number,
//   ctrl: typeof FOR_CONTROLLER,
//   ctx: ReactiveStreamCreater<I>,
// ) => O | $PromiseMaybe<$ForController>;

// const rs = new ReactiveStream(
//   (async function* () {
//     yield { age: 1 };
//     yield { xxx: 1 };
//   })(),
// );
// import { isPromiseLike } from "../extends-promise-is/index.ts";

// // const Filter = function <T, R extends T>(
// //   filter: (item: T, index: number, ctx: ReactiveStream<T>) => $PromiseMaybe<boolean>,
// // ): $PipeHanlder<T, R> {
// //   return (item, index, ctrl, ctx) => {
// //     const res = filter(item, index, ctx);
// //     if (isPromiseLike(res)) {
// //       return res.then((res) => {
// //         if (res) {
// //           return item;
// //         }
// //         return ctrl.continue;
// //       }) as unknown as R;
// //     }
// //     if (res) {
// //       return item as unknown as R;
// //     }
// //     return ctrl.continue;
// //   };
// // };

// // rs.fork().addTransfer(
// //   Filter<unknown, { age: number }>((item) => {
// //     return typeof item.age === "number";
// //   }),
// // );

// // Filter(rs);

// // import type { filter, map } from "rxjs/operators";
// // const map = <R, RS>(hanlder: (this: RS, item: ReactiveStream.GetType<RS>) => R) => {};
// // rs.pipe(map((item) => item));
// // rs.pipe((item) => item.age ?? 0);

// // class FilterPiper<INPUT> implements Piper<INPUT> {
// //     private _filter:()=>{

// //     },
// //   map<R>(
// //     item: INPUT,
// //     index: number,
// //     ctrl: typeof FOR_CONTROLLER,
// //   ): R | $PromiseMaybe<$ForController>;
// // }

// // rs.createPiper();

// // async () => {
// //   for await (const v of rs.filter<{ age: number }>((v) => typeof v?.age === "number")) {
// //   }
// //   for await (const v of rs.map((v, i, ctrl) => {
// //     if (typeof v?.age === "number") {
// //       return v as { age: number };
// //     }
// //     return ctrl.continue;
// //   })) {
// //   }

// //   rs.pipe({
// //     map: (item) => {},
// //   });
// // };

// // type $PipeHanlder<I, O> = {
// //   map: $PipeHanlder.Map<I, O>;
// // };

// // declare namespace $PipeHanlder {
// //   type Filter<T, R extends T = T> =
// //     | ((item: T, index: number) => $PromiseMaybe<boolean>)
// //     | ((i: T, index: number) => i is R);
// //   type Map<T, R> = (
// //     item: T,
// //     index: number,
// //     ctrl: typeof FOR_CONTROLLER,
// //   ) => R | $PromiseMaybe<$ForController>;
// // }

// type $Filter<T, R extends T = T> =
//   | ((item: T, index: number) => $PromiseMaybe<boolean>)
//   | ((i: T, index: number) => i is R);
