import { createReadStream, fsExistsSync } from "./fileFactory";
import os from "os";
import path from "path";
import { IPackages } from "typings/packages";
import chalk from "chalk";
import { PROJECTSNAME } from "./tsconfigFactory";

/**
 * 创建依赖，为写入#bfsp做准备
 * @param rootPath
 * @returns
 */
async function createDependencies(rootPath: string): Promise<IPackages> {
  const packageJsonPath = path.join(rootPath, "package.json");
  let index: string = "./index.ts";
  // 先找一下src有没有index.ts
  if (fsExistsSync(path.join(rootPath, "src", "index.ts"))) {
    index = "./src/index.ts";
  }
  // 如果没有packages.json,摆烂
  if (!fsExistsSync(packageJsonPath)) return { name: "", index: "./index.ts" };
  const dataChunk = await createReadStream(packageJsonPath);
  let configJson: IPackages = {
    name: "",
    index: "",
  };
  try {
    configJson = JSON.parse(dataChunk as string);
  } catch (e) {
    console.log(chalk.red(`${os.EOL}请检查 ${packageJsonPath} 文件是否符合json标准格式:${e}`));
  }
  // 如果有互相依赖的需要移动到deps里面去
  const deps: string[] = [];
  const dependencies = ["dependencies", "devDependencies", "peerDependencies"];
  dependencies.map((item) => {
    if (configJson[item] && Object.keys(configJson[item]).length !== 0) {
      Object.keys(configJson[item]).forEach((dep) => {
        if (PROJECTSNAME.indexOf(dep) !== -1) {
          deps.push(`'${dep}'`);
          delete configJson[item]![dep];
        }
      });
    }
  });

  // 拿到每个项目的依赖
  return {
    name: configJson.name,
    index: index,
    deps: deps,
    dependencies: configJson.dependencies ?? {},
    devDependencies: configJson.devDependencies ?? {},
    peerDependencies: configJson.peerDependencies ?? {},
  };
}

export const createBfspContext = async (
  workspace: string,
  packageName?: string,
  project?: string,
) => {
  // 这里的格式已经是指向新的目录了所以需要回退
  workspace = path.resolve(workspace, "..");
  if (packageName && project) {
    workspace = path.join(workspace, packageName, project);
  }
  const dep = await createDependencies(workspace);
  const bfsp = `
  import { defineConfig } from "@bfchain/pkgm-bfsp";
  export default defineConfig((info) => {
    const config: Bfsp.UserConfig = {
      name: "${dep.name}",
      exports: {
        ".":"${dep.index}",
      },
      deps:[${dep.deps}],
      packageJson: {
        license: "MIT",
        author: "BFChainer",
        dependencies: ${JSON.stringify(dep.dependencies)},
        devDependencies: ${JSON.stringify(dep.devDependencies)},
        peerDependencies: ${JSON.stringify(dep.peerDependencies)},
      },
    };
    return config;
  });
  `;
  return bfsp;
};
export const createBfswContext = () => {
  const bfsw = `
  import { defineWorkspace } from "@bfchain/pkgm-bfsw";
  export default defineWorkspace(() => {
    const config: Bfsw.Workspace = {
      projects: [],
    };
    return config;
  });
  `;
  return bfsw;
};
