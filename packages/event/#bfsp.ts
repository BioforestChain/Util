import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util-event", info),
    deps: [
      "@bfchain/util-event-base",
      "@bfchain/util-event-map-emitter",
      "@bfchain/util-event-quene-emitter",
      "@bfchain/util-extends-promise-out",
      "@bfchain/util-typings",
    ],
  };
  return config;
});
