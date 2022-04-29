import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
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
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "5.0.0",
      // dependencies: {
      //   "@bfchain/util-aborter": "link:../aborter/build/@bfchain/util-aborter",
      //   "@bfchain/util-buffer": "link:../buffer/build/@bfchain/util-buffer",
      //   "@bfchain/util-decorator":
      //     "link:../decorator/build/@bfchain/util-decorator",
      //   "@bfchain/util-deepcopy":
      //     "link:../deepcopy/build/@bfchain/util-deepcopy",
      //   "@bfchain/util-deepmix": "link:../deepmix/build/@bfchain/util-deepmix",
      //   "@bfchain/util-dep-inject":
      //     "link:../dep_inject/build/@bfchain/util-dep-inject",
      //   "@bfchain/util-encoding-binary":
      //     "link:../encoding-binary/build/@bfchain/util-encoding-binary",
      //   "@bfchain/util-encoding-hex":
      //     "link:../encoding-hex/build/@bfchain/util-encoding-hex",
      //   "@bfchain/util-encoding-utf8":
      //     "link:../encoding-utf8/build/@bfchain/util-encoding-utf8",
      //   "@bfchain/util-env": "link:../env/build/@bfchain/util-env",
      //   "@bfchain/util-event": "link:../event/build/@bfchain/util-event",
      //   "@bfchain/util-exception":
      //     "link:../exception/build/@bfchain/util-exception",
      //   "@bfchain/util-extends-array":
      //     "link:../extends-array/build/@bfchain/util-extends-array",
      //   "@bfchain/util-extends-async-iterator":
      //     "link:../extends-async_iterator/build/@bfchain/util-extends-async-iterator",
      //   "@bfchain/util-extends-error":
      //     "link:../extends-error/build/@bfchain/util-extends-error",
      //   "@bfchain/util-extends-function":
      //     "link:../extends-function/build/@bfchain/util-extends-function",
      //   "@bfchain/util-extends-iterator":
      //     "link:../extends-iterator/build/@bfchain/util-extends-iterator",
      //   "@bfchain/util-extends-map":
      //     "link:../extends-map/build/@bfchain/util-extends-map",
      //   "@bfchain/util-extends-object":
      //     "link:../extends-object/build/@bfchain/util-extends-object",
      //   "@bfchain/util-extends-promise":
      //     "link:../extends-promise/build/@bfchain/util-extends-promise",
      //   "@bfchain/util-extends-promise-out":
      //     "link:../extends-promise-out/build/@bfchain/util-extends-promise-out",
      //   "@bfchain/util-extends-set":
      //     "link:../extends-set/build/@bfchain/util-extends-set",
      //   "@bfchain/util-fast-deep-equal":
      //     "link:../fast_deep_equal/build/@bfchain/util-fast-deep-equal",
      //   "@bfchain/util-i18n": "link:../i18n/build/@bfchain/util-i18n",
      //   "@bfchain/util-lock-atom":
      //     "link:../lock-atom/build/@bfchain/util-lock-atom",
      //   "@bfchain/util-logger": "link:../logger/build/@bfchain/util-logger",
      //   "@bfchain/util-ms": "link:../ms/build/@bfchain/util-ms",
      //   "@bfchain/util-platform":
      //     "link:../platform/build/@bfchain/util-platform",
      //   "@bfchain/util-reactive-array":
      //     "link:../reactive-array/build/@bfchain/util-reactive-array",
      //   "@bfchain/util-reactive-stream":
      //     "link:../reactive-stream/build/@bfchain/util-reactive-stream",
      //   "@bfchain/util-type-detect":
      //     "link:../type_detect/build/@bfchain/util-type-detect",
      //   "@bfchain/util-typings": "link:../typings/build/@bfchain/util-typings",
      // },
    },
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
