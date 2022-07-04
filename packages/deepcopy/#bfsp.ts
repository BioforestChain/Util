import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genNodeBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genNodeBfspConfig("@bfchain/util-deepcopy", info),
    deps: [
      "@bfchain/util-type-detect",
      // "@bfchain/util-typings"
    ],
  };
  return config;
});
