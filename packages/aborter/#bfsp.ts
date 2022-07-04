import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-aborter", info),
    deps: [
      "@bfchain/util-extends-promise-out",
      "@bfchain/util-extends-promise-safe",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
