import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-extends-async-iterator", info),
    deps: [
      "@bfchain/util-extends-array",
      "@bfchain/util-extends-promise",
      // "@bfchain/util-typings",
    ],
  };
  return config;
});
