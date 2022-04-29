import "@bfchain/util-typings";
export * from "./constants";
export { cacheGetter } from "@bfchain/util-decorator";
export { renameFunction } from "@bfchain/util-extends-function";
export { GetCallerInfo } from "@bfchain/util-extends-error";

import { isFlagInDev } from "@bfchain/util-env";
export const isDev = isFlagInDev("eventemitter") && isFlagInDev("browser");
