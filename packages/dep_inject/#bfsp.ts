import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-dep-inject", info, {
      dependencies: {
        "reflect-metadata": "^0.1.13",
      },
    }),
    deps: ["@bfchain/util-typings", "@bfchain/util-extends-map"],
  };
  return config;
});
