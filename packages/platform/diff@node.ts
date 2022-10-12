import { $NodeJS } from "../typings/$types.ts";

/**
 * for nodejs
 */
declare const process: $NodeJS.Process;

export const isNodejs = Boolean(
  typeof process !== "undefined" &&
    process &&
    process.versions &&
    process.versions.node
);

export const isWin32 =
  typeof process !== "undefined" &&
  (process.platform === "win32" ||
    /^(msys|cygwin)$/.test(process.env && process.env.OSTYPE));
