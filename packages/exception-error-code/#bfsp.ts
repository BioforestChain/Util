import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-exception-error-code", info),
    deps: [
      // "@bfchain/util-extends-object",
      // "@bfchain/util-typings"
    ],
  };
  return config;
});
