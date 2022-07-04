import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-extends-promise-is", info),
    name: "@bfchain/util-extends-promise-is",
      };
  return config;
});
