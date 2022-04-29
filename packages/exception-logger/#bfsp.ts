import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-exception-logger",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["cjs", "esm"],
    profiles: ["node", "browser", "default"],
    deps: [
      "@bfchain/util-extends-object",
      "@bfchain/util-logger",
      // "@bfchain/util-typings",
    ],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "5.0.0",
    },
    build: [
      {
        profiles: ["browser"],
        outSubPath: "browser",
      },
      {
        profiles: ["node"],
        outSubPath: "node",
      },
    ],
  };
  return config;
});
