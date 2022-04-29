import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-exception",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    deps: [
      "@bfchain/util-dep-inject",
      "@bfchain/util-exception-error-code",
      "@bfchain/util-exception-generator",
      "@bfchain/util-exception-logger",
      "@bfchain/util-extends-error",
      "@bfchain/util-logger",
      "@bfchain/util-platform",
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
