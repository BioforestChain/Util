import { ExceptionGenerator, CustomErrorCodeMap } from "@bfchain/util-exception-generator";
import { LogGenerator } from "@bfchain/util-exception-logger";
import { platformInfo } from "@bfchain/util-platform";
import { Inject, ModuleStroge, Injectable, Resolve } from "@bfchain/util-dep-inject";

function MixExceptionGenerator(
  PLATFORM: string,
  CHANNEL: string,
  BUSINESS: string,
  MODULE: string,
  FILE: string,
  ERROR_CODE_MAP: Map<string, string>,
) {
  let loggerNsp = `${CHANNEL.toLowerCase()}-${BUSINESS.toLowerCase()}`;
  if (MODULE) {
    loggerNsp += `:${MODULE}`;
  }
  if (FILE) {
    loggerNsp += `/${FILE}`;
  }

  const logs = LogGenerator(loggerNsp);
  const exps = ExceptionGenerator(PLATFORM, CHANNEL, BUSINESS, MODULE, FILE, ERROR_CODE_MAP);

  return new Proxy({} as typeof logs & typeof exps, {
    get(t, p) {
      return (t as any)[p] || (logs as any)[p] || (exps as any)[p];
    },
  });
}

export enum EXCEPTION_INJECT_SYMBOL {
  PLATFORM = "exception.platform",
  CHANNEL = "exception.channel",
  BUSINESS = "exception.business",
}
export function RegisterExceptionGeneratorDefiner(opts: {
  platform?: string;
  channel?: string;
  business?: string;
}) {
  const defaultPlatformName =
    typeof opts.platform === "string"
      ? opts.platform
      : platformInfo.getGlobalFlag("PLATFORM") || platformInfo.platformName();
  const defaultChannelName =
    typeof opts.platform === "string"
      ? opts.platform
      : platformInfo.getGlobalFlag("CHANNEL") || platformInfo.getChannel();
  const defaultBusinessName =
    typeof opts.platform === "string"
      ? opts.platform
      : platformInfo.getGlobalFlag("BUSINESS") || platformInfo.getBusiness();

  return function define(
    moduleName: string,
    fileName: string,
    opts: {
      errorCodeMap: Map<string, string>;
      platformName?: string;
      channelName?: string;
      businessName?: string;
    },
  ) {
    return MixExceptionGenerator(
      opts.platformName || defaultPlatformName,
      opts.channelName || defaultChannelName,
      opts.businessName || defaultBusinessName,
      moduleName,
      fileName,
      opts.errorCodeMap,
    );
  };
}
@Injectable("bfchain-util:custom-exception", { singleton: true })
export class SingleCustomException {
  constructor(public moduleMap: ModuleStroge) {}
  @Inject(EXCEPTION_INJECT_SYMBOL.PLATFORM, { dynamics: true, optional: true })
  public platformName?: string = undefined;
  @Inject(EXCEPTION_INJECT_SYMBOL.CHANNEL, { dynamics: true, optional: true })
  public channelName?: string = undefined;
  @Inject(EXCEPTION_INJECT_SYMBOL.BUSINESS, { dynamics: true, optional: true })
  public businessName?: string = undefined;
  exceptionGeneratorDefiner = RegisterExceptionGeneratorDefiner({
    platform: this.platformName,
    channel: this.channelName,
    business: this.businessName,
  });
}
const myException = Resolve(SingleCustomException);

export function UtilExceptionGenerator(
  moduleName: string,
  fileName: string,
  opts?: {
    errorCodeMap: Map<string, string>;
    platformName?: string;
    channelName?: string;
    businessName?: string;
  },
) {
  return myException.exceptionGeneratorDefiner(
    moduleName,
    fileName,
    Object.assign({ errorCodeMap: CustomErrorCodeMap, businessName: "util" }, opts),
  );
}

//#endregion
