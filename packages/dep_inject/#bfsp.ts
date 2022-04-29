import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-dep-inject",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    deps: ["@bfchain/util-typings", "@bfchain/util-extends-map"],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "4.13.0",
      dependencies: {
        "reflect-metadata": "^0.1.13",
      },
      devDependencies: {
        "@types/node": "latest",
      },
    },
  };
  return config;
});
