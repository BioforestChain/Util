import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-event-quene-emitter", info),
    deps: [
      "@bfchain/util-decorator",
      "@bfchain/util-env",
      "@bfchain/util-event-base",
      "@bfchain/util-extends-error",
      "@bfchain/util-extends-function",
      "@bfchain/util-extends-iterator-is",
      "@bfchain/util-extends-promise-out",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
