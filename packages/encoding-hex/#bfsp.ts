import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-encoding-hex", info),
      };
  return config;
});
