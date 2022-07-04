import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-typings", info, {
      dependencies: {
        tslib: "^2.4.0",
      },
    }),
  };
  return config;
});
