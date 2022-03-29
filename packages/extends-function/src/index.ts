export function renameFunction(fun: Function, newName: string) {
  const hanlder_name_des = Object.getOwnPropertyDescriptor(fun, "name");
  if (hanlder_name_des && hanlder_name_des.configurable) {
    Object.defineProperty(fun, "name", {
      value: newName,
      configurable: true,
    });
  }
}

export function OmitStatic<T extends new (...args: any) => any, K extends keyof T>(
  ctor: T,
  ...k: K[]
): Omit<T, K> & (new (...args: ConstructorParameters<T>) => InstanceType<T>) {
  return ctor;
}
