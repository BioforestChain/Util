import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genNodeBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genNodeBfspConfig("@bfchain/util-type-detect", info, {
      devDependencies: {
        "@types/node": "latest",
      },
    }),
  };
  return config;
});
