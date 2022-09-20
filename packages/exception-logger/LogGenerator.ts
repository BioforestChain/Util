import { loggerCreater as lc, Debug, LOGGER_LEVEL } from "../logger/index.ts";
// const lc: any = {};
// const LOGGER_LEVEL: any = {};
import { cacheObjectGetter } from "../extends-object/index.ts";
// const cacheObjectGetter: any = {};
import { typeColorHashMap } from "!exception-logger/typeColor";

function createPrinter(nsp: string, color: unknown, level: number) {
  const logger = lc.create(nsp);
  if (color === undefined) {
    logger.forceSetUseColors(false);
  } else {
    logger.forceSetUseColors(true);
  }

  return logger.createPrinter(
    color === "inherit" ? logger.color : (color as any),
    level
  );
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
