import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-decorator", info, {
      dependencies: {
        tslib: "^2.4.0",
      },
    }),
    deps: [
      "@bfchain/util-typings",
      // "@bfchain/util-extends-promise-out"
    ],
  };
  return config;
});
