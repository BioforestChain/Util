import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-binary-tree-map",
    exports: {
      ".": "./src/BinaryTreeMap.ts",
    },
    formats: ["esm", "cjs"],
    // deps: ["@bfchain/util-typings", "@bfchain/util-decorator"],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "4.13.0",
    },
  };
  return config;
});
