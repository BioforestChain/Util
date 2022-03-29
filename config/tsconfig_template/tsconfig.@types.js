// @ts-check
const fs = require("fs");
const path = require("path");
const { prettierFormat } = require("@bfchain/devkit");
/**
 * 
//  * @param {import("@bfchain/devkit")[']} args 
 */
function generateJsonConfigFile(args) {
  const { packageJson, env, toJson } = args;
  if (!toJson.extends) {
    toJson.extends = "./tsconfig";
  }
  if (!toJson.mixin) {
    toJson.mixin = ["./tsconfig.json", "../../config/tsconfig_base/base.tsconfig.@types.json"];
  }
  const compilerOptions = toJson.compilerOptions || (toJson.compilerOptions = {});

  /// 初始化配置declarationDir
  if (!compilerOptions.declarationDir) {
    compilerOptions.declarationDir = `../@types/${packageNameToTypesName(packageJson.name)}`;
    compilerOptions.declaration = true;
  }

  /// 如果没有默认的outDir路径，或者没有 noEmit 的声明，那么默认不去生成 js文件
  if (true || !compilerOptions.outDir) {
    compilerOptions.outDir = `../../.cache/${env.PACKAGE_SHORT_NAME}`;
  }
  if (true || !compilerOptions.tsBuildInfoFile) {
    compilerOptions.tsBuildInfoFile = `../../.cache/${env.PACKAGE_SHORT_NAME}/@types.tsbuildinfo`;
  }

  if (!toJson.references) {
    toJson.references = [];
  }
  /// 往@types/*文件夹中写入package.json
  // console.log(env)
  const typingPackagePath = path.resolve(
    env.PACKAGE,
    compilerOptions.declarationDir,
    "package.json",
  );
  if (!fs.existsSync(typingPackagePath)) {
    const typingPackageJson = {}; // JSON.parse(JSON.stringify(packageJson));
    typingPackageJson.name = `@types/${packageNameToTypesName(packageJson.name)}`;
    typingPackageJson.types = "index.d.ts";
    typingPackageJson.version = packageJson.version;
    typingPackageJson.dependencies = {};
    for (const packageName in packageJson.dependencies) {
      if (packageName.startsWith("@bfchain/core")) {
        typingPackageJson.dependencies[`@types/${packageNameToTypesName(packageName)}`] =
          packageJson.dependencies[packageName];
      }
    }

    const typingPackageFolderPath = path.resolve(typingPackagePath, "..");
    if (!fs.existsSync(typingPackageFolderPath)) {
      fs.mkdirSync(typingPackageFolderPath, {
        recursive: true,
      });
    }

    fs.writeFileSync(
      typingPackagePath,
      prettierFormat(JSON.stringify(typingPackageJson), { parser: "json-stringify" }),
    );
  }

  return toJson;
}

/**
 *
 * @param {string} packageName
 */
function packageNameToTypesName(packageName) {
  /**@type {string} */
  let typesPackageName = packageName;

  if (packageName.startsWith("@") && packageName.includes("/")) {
    typesPackageName = typesPackageName.slice(1).replace(/\//g, "__");
  }
  return typesPackageName;
}

exports.generateJsonConfigFile = generateJsonConfigFile;
