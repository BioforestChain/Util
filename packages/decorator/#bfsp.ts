import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-decorator",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    deps: [
      "@bfchain/util-typings",
      // "@bfchain/util-extends-promise-out"
    ],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "5.0.0",
      dependencies: {
        tslib: "^2.3.1",
      },
    },
  };
  return config;
});
