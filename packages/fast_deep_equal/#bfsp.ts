import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-fast-deep-equal", info),
    deps: [
      "@bfchain/util-type-detect",
      // "@bfchain/util-typings"
    ],
  };
  return config;
});
