import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-extends-map", info),
    deps: [
      "@bfchain/util-decorator",
      // "@bfchain/util-typings"
    ],
  };
  return config;
});
