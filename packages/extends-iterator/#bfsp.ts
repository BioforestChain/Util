import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-extends-iterator", info),
    deps: [
      "@bfchain/util-extends-iterator-is",
      // "@bfchain/util-typings"
    ],
  };
  return config;
});
