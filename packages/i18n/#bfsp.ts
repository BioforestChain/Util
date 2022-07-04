import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-i18n", info),
    deps: [
      "@bfchain/util-dep-inject",
      "@bfchain/util-exception-error-code",
      // "@bfchain/util-typings",
    ],
  };
  return config;
});
