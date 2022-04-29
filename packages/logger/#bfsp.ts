import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-logger",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    profiles: ["node", "browser", "default"],
    deps: [
      "@bfchain/util-decorator",
      "@bfchain/util-env",
      "@bfchain/util-extends-map",
      "@bfchain/util-ms",
      "@bfchain/util-platform",
      "@bfchain/util-typings",
    ],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "5.0.0",
      devDependencies: {
        "@types/node": "latest",
      },
    },
    build: [
      {
        name: "@bfchain/util-logger",
        profiles: ["node"],
        outSubPath: "node",
      },
      {
        name: "@bfchain/util-logger",
        profiles: ["browser"],
        outSubPath: "browser",
      },
    ],
  };
  return config;
});
