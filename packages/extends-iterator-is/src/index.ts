export const isAsyncGeneratorInstance = <T = AsyncGenerator>(maybe: any): maybe is T => {
  if (maybe && maybe.constructor) {
    return (
      typeof maybe.next === "function" &&
      typeof maybe.return === "function" &&
      typeof maybe.throw === "function" &&
      typeof maybe[Symbol.asyncIterator] === "function" &&
      maybe[Symbol.asyncIterator]() === maybe
    );
  }
  return false;
};
export const isGeneratorInstance = <T = Generator>(maybe: any): maybe is T => {
  if (maybe) {
    return (
      typeof maybe.next === "function" &&
      typeof maybe.return === "function" &&
      typeof maybe.throw === "function" &&
      typeof maybe[Symbol.iterator] === "function" &&
      maybe[Symbol.iterator]() === maybe
    );
  }
  return false;
};
