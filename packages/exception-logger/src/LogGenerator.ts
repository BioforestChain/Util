import { loggerCreater as lc, Debug, LOGGER_LEVEL } from "@bfchain/util-logger";
import { cacheObjectGetter } from "@bfchain/util-extends-object";

let typeColorHashMap = {
  log: undefined as unknown,

  info: undefined as unknown,
  warn: undefined as unknown,
  trace: undefined as unknown,

  success: undefined as unknown,
  error: undefined as unknown,
};
if (lc.colorTypeName === "node") {
  typeColorHashMap = {
    log: 0,
    info: 6,
    trace: 6,
    success: 2,
    warn: 3,
    error: 1,
  };
} else if (lc.colorTypeName === "browser") {
  typeColorHashMap = {
    log: "inherit", // "grey",
    info: "inherit", // "cyan",
    trace: "inherit", // "cyan",
    success: "inherit", // "green",
    warn: "inherit", // "orange",
    error: "inherit", // "darkred",
  };
}
function createPrinter(nsp: string, color: unknown, level: number) {
  const logger = lc.create(nsp);
  if (color === undefined) {
    logger.forceSetUseColors(false);
  } else {
    logger.forceSetUseColors(true);
  }

  return logger.createPrinter(color === "inherit" ? logger.color : (color as any), level);
}
//#region 日志工具
export function LogGenerator(nsp: string) {
  const loggerHashMap = {
    get log() {
      return createPrinter(nsp, typeColorHashMap.log, LOGGER_LEVEL.log);
    },
    get info() {
      return createPrinter(nsp, typeColorHashMap.info, LOGGER_LEVEL.info);
    },
    get warn() {
      return createPrinter(nsp, typeColorHashMap.warn, LOGGER_LEVEL.warn);
    },
    get success() {
      return createPrinter(nsp, typeColorHashMap.success, LOGGER_LEVEL.success);
    },
    get trace() {
      return createPrinter(nsp, typeColorHashMap.trace, LOGGER_LEVEL.trace);
    },
    get error() {
      return createPrinter(nsp, typeColorHashMap.error, LOGGER_LEVEL.error);
    },
  };
  return cacheObjectGetter(loggerHashMap);
}

export const exceptionLoggerCreater = lc;

//#endregion
