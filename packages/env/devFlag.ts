import { platformInfo } from "../platform/index.ts";

const ENV = platformInfo.getGlobalFlag("BFCHAIN_ENV", "development");
ENV.split(",").map((flag) => flag.trim());
const _envFlags = new Map<string, string | undefined>();

for (const flag of ENV.split(",")) {
  const [_flagKey, flagValue] = flag.split("=").map((item) => item.trim());
  let flagKey = _flagKey;
  let remove = false;
  if (flagKey.startsWith("- ")) {
    remove = true;
    flagKey = flagKey.substr(2);
  }
  if (remove) {
    _envFlags.delete(flagKey);
  } else {
    _envFlags.set(flagKey, flagValue);
  }
}

export function isFlagInDev(flag: string) {
  return _envFlags.has(flag);
}
