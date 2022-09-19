export { cacheGetter } from "../decorator/index.ts";
export { GetCallerInfo } from "../extends-error/index.ts";
export { renameFunction } from "../extends-function/index.ts";
export * from "./$types.ts";
export * from "./constants.ts";

import { isFlagInDev } from "../env/index.ts";
export const isDev = isFlagInDev("eventemitter") && isFlagInDev("browser");
