import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-event",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    deps: [
      "@bfchain/util-event-base",
      "@bfchain/util-event-map-emitter",
      "@bfchain/util-event-quene-emitter",
      "@bfchain/util-extends-promise-out",
      "@bfchain/util-typings",
    ],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "4.13.0",
    },
  };
  return config;
});
