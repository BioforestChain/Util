import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-encoding-utf8",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    // deps: ["@bfchain/util-typings"],
    profiles: ["browser", "node", "default"],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "4.13.0",
      devDependencies: {
        "@types/node": "latest",
      },
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
