import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-logger", info),
    // profiles: ["node", "browser", "default"],
    deps: [
      "@bfchain/util-decorator",
      "@bfchain/util-env",
      "@bfchain/util-extends-map",
      "@bfchain/util-ms",
      "@bfchain/util-platform",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
