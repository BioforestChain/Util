import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-exception-logger", info),
    // profiles: ["node", "browser", "default"],
    deps: [
      "@bfchain/util-extends-object",
      "@bfchain/util-logger",
      // "@bfchain/util-typings",
    ],
  };
  return config;
});
