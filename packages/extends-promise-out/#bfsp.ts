import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-extends-promise-out",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    deps: [
      "@bfchain/util-extends-promise-is",
      // "@bfchain/util-typings"
    ],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "5.0.0",
      devDependencies: {
        "@types/node": "latest",
      },
    },
  };
  return config;
});
