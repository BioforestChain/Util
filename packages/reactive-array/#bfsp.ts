import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-reactive-array", info),
    deps: [
      "@bfchain/util-extends-promise-is",
      "@bfchain/util-extends-promise-out",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
