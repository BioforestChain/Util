import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-event-base", info),
    // profiles: ["node", "browser", "default"],
    deps: [
      "@bfchain/util-decorator",
      "@bfchain/util-env",
      "@bfchain/util-extends-error",
      "@bfchain/util-extends-function",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
