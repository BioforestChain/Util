import type {} from "@bfchain/util-typings";
import "./@types";
export * from "./common";
import DebugCreaterFactory from "@bfchain/util-logger/debug-creator";

export const loggerCreater = DebugCreaterFactory();
