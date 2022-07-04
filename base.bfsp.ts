import "@bfchain/pkgm-bfsp";
/**
 * 不需要node环境的包
 * @FIXME 移除这个玩意儿，理论上默认情况下所有包只需要依赖 dom-worker 环境
 */
const ignore_node_type_packages = new Set([
  "@bfchain/util",
  "@bfchain/util-typings",
  "@bfchain/util-ms",
  "@bfchain/util-lock-atom",
  "@bfchain/util-i18n",
  "@bfchain/util-fast-deep-equal",
  "@bfchain/util-extends-set",
  "@bfchain/util-extends-promise-is",
  "@bfchain/util-extends-promise",
  "@bfchain/util-extends-object",
  "@bfchain/util-extends-map",
  "@bfchain/util-extends-iterator-is",
  "@bfchain/util-extends-iterator",
  "@bfchain/util-extends-function",
  "@bfchain/util-extends-async-iterator",
  "@bfchain/util-extends-array",
  "@bfchain/util-exception-error-code",
  "@bfchain/util-exception",
  "@bfchain/util-event-quene-emitter",
  "@bfchain/util-event-map-emitter",
  "@bfchain/util-event",
  "@bfchain/util-env",
  "@bfchain/util-encoding-hex",
  "@bfchain/util-encoding-binary",
  "@bfchain/util-deepmix",
  "@bfchain/util-binary-tree-map",
  "@bfchain/util-aborter",
]);
/**
 * node和browser需要分开来写的包
 *
 * util默认是支持browser，然后才是对nodejs做了兼容
 * @TODO 未来browser环境也不需要依赖，而是依赖 `@bfchain/util-env-*` 来获取不同环境的基本兼容性支持。这里通过optionsDeps来按需安装依赖
 */
const node_and_browser_packages = new Set([
  "@bfchain/util-logger",
  "@bfchain/util-exception-logger",
  "@bfchain/util-event-base",
  "@bfchain/util-encoding-utf8",
]);

export const version = "5.0.0";

export const genBfspConfig = (
  name: string,
  info: Bfsp.ConfigEnvInfo,
  extendsPackageJson?: Bfsp.UserConfig["packageJson"],
  extendsTsconfigCompilerOptions?: Bfsp.TsConfig["compilerOptions"]
) => {
  const config: Bfsp.UserConfig = {
    name,
    exports: {
      ".": "./src/index.ts",
    },
    formats: ["esm", "cjs"],
    deps: name === "@bfchain/util-typings" ? [] : ["@bfchain/util-typings"],
    packageJson: {
      license: "CC-BY-NC-SA-4.0",
      author: "Gaubee",
      version,
      ...(node_and_browser_packages.has(name)
        ? {
            devDependencies: {
              "@types/node": "latest",
            },
          }
        : {}),
      ...extendsPackageJson,
    },
    profiles: ["browser", "default"],
    tsConfig: {
      compilerOptions: {
        lib: ["DOM", "ES2020"],
        ...extendsTsconfigCompilerOptions,
      },
    },
    ...(node_and_browser_packages.has(name)
      ? {
          build: [
            {
              name,
              profiles: ["node", "default"],
              outSubPath: "node",
            },
            {
              name,
              profiles: ["browser", "default"],
              outSubPath: "browser",
            },
          ],
        }
      : {}),
  };
  return config;
};
export const genNodeBfspConfig = (
  name: string,
  info: Bfsp.ConfigEnvInfo,
  extendsPackageJson: Bfsp.UserConfig["packageJson"] = {
    dependencies: {
      "@types/node": "latest",
    },
  },
  extendsTsconfigCompilerOptions: Bfsp.TsConfig["compilerOptions"] = {
    types: ["node"],
  }
) => {
  return genBfspConfig(
    name,
    info,
    extendsPackageJson,
    extendsTsconfigCompilerOptions
  );
};
