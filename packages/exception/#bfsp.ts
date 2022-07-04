import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-exception", info),
    deps: [
      "@bfchain/util-dep-inject",
      "@bfchain/util-exception-error-code",
      "@bfchain/util-exception-generator",
      "@bfchain/util-exception-logger",
      "@bfchain/util-extends-error",
      "@bfchain/util-extends-object",
      "@bfchain/util-logger",
      "@bfchain/util-platform",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
