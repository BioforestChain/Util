import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-extends-promise-out", info),
    deps: [
      "@bfchain/util-extends-promise-is",
      // "@bfchain/util-typings"
    ],
  };
  return config;
});
