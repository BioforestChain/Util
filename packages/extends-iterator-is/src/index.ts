export const isAsyncGeneratorInstance = (maybe: any) => {
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
export const isGeneratorInstance = (maybe: any) => {
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
