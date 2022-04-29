import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "@bfchain/util-exception-generator",
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    deps: [
      "@bfchain/util-exception-error-code",
      "@bfchain/util-extends-object",
      "@bfchain/util-extends-error",
      "@bfchain/util-typings",
    ],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version: "4.13.0",
      // dependencies: {
      //   "@bfchain/util-typings": "link:../typings/build/@bfchain/util-typings",
      //   "@bfchain/util-extends-object":
      //     "link:../extends-object/build/@bfchain/util-extends-object",
      //   "@bfchain/util-extends-error":
      //     "link:../extends-error/build/@bfchain/util-extends-error",
      //   "@bfchain/util-exception-error-code":
      //     "link:../exception-error-code/build/@bfchain/util-exception-error-code",
      // },
      devDependencies: {
        "@types/node": "latest",
      },
    },
  };
  return config;
});
