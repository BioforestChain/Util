import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-exception-generator", info),
    deps: [
      "@bfchain/util-exception-error-code",
      "@bfchain/util-extends-object",
      "@bfchain/util-extends-error",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
