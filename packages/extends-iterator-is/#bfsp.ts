import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-extends-iterator-is",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    // deps: ["@bfchain/util-typings"],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "5.0.0",
    },
  };
  return config;
});
