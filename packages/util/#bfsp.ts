import { defineConfig } from "@bfchain/pkgm-bfsp";
import { genBfspConfig } from "../../base.bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    ...genBfspConfig("@bfchain/util", info),
    profiles: ["node", "browser", "default"],
    deps: [
      "@bfchain/util-aborter",
      "@bfchain/util-buffer",
      "@bfchain/util-decorator",
      "@bfchain/util-deepcopy",
      "@bfchain/util-deepmix",
      "@bfchain/util-dep-inject",
      "@bfchain/util-encoding-binary",
      "@bfchain/util-encoding-hex",
      "@bfchain/util-encoding-utf8",
      "@bfchain/util-env",
      "@bfchain/util-event",
      "@bfchain/util-exception",
      "@bfchain/util-extends-array",
      "@bfchain/util-extends-async-iterator",
      "@bfchain/util-extends-error",
      "@bfchain/util-extends-function",
      "@bfchain/util-extends-iterator",
      "@bfchain/util-extends-map",
      "@bfchain/util-extends-object",
      "@bfchain/util-extends-promise",
      "@bfchain/util-extends-promise-out",
      "@bfchain/util-extends-set",
      "@bfchain/util-fast-deep-equal",
      "@bfchain/util-i18n",
      "@bfchain/util-lock-atom",
      "@bfchain/util-logger",
      "@bfchain/util-ms",
      "@bfchain/util-platform",
      "@bfchain/util-reactive-array",
      "@bfchain/util-reactive-stream",
      "@bfchain/util-type-detect",
      "@bfchain/util-typings",
    ],
    build: [
      {
        name: "@bfchain/util",
        profiles: ["node"],
        outSubPath: "node",
      },
      {
        name: "@bfchain/util",
        profiles: ["browser"],
        outSubPath: "browser",
      },
    ],
  };
  return config;
});
