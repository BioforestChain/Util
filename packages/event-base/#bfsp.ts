import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-event-base",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    profiles: ["node", "browser", "default"],
    deps: [
      "@bfchain/util-decorator",
      "@bfchain/util-env",
      "@bfchain/util-extends-error",
      "@bfchain/util-extends-function",
      "@bfchain/util-typings",
    ],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "5.0.0",
    },
    build: [
      {
        profiles: ["node"],
        outSubPath: "node",
      },
      {
        profiles: ["browser"],
        outSubPath: "browser",
      },
    ],
  };
  return config;
});
