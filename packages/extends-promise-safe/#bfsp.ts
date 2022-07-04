import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-extends-promise-safe", info),
    deps: ["@bfchain/util-extends-promise-out", "@bfchain/util-typings"],
  };
  return config;
});
