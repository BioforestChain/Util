import chalk from "chalk";
import path from "path";
import { ICompilerOptions } from "typings/file";
import {
  createReadStream,
  fsExistsSync,
  getWorkspaceContext,
  readSrcDirAllFile,
} from "./fileFactory";

/**这里面的内容主要是提取tsconfig内容 */

let needCopy: string[] = [];
/**
 * 只迁移tsconfig中指定的有效文件，files字段，没有这个字段就用rootDir/rootDirs
 * @param rootPath 迁移文件夹的根目录
 * @param observerWorkspack bfsw路径
 * @returns
 */
export const getNeedCopyFile = async (rootPath: string, observerWorkspack: string[]) => {
  // 如果是bfsw
  if (observerWorkspack.length !== 0) {
    // 因为mono风格项目的packages不只一个
    await Promise.all(
      observerWorkspack.map(async (packages) => {
        const packageProject = path.join(rootPath, packages);
        await getChildTsconfig(packageProject);
      }),
    );
    return needCopy;
  }
  // 如果是单个项目
  await getTsconfigFiles(rootPath);
  return needCopy;
};

/**
 * 拿到里面的所有项目
 * @param childProject
 */
async function getChildTsconfig(packageProject: string) {
  const files = await readSrcDirAllFile(packageProject);
  // 找到每个项目的地址
  await Promise.all(
    files.map(async (project) => {
      const childProject = path.join(packageProject, project);
      await getTsconfigFiles(childProject);
    }),
  );
}

/**
 * 拿到tsconfig
 * @param rootPath
 * @param current 当前地址
 * @returns
 */
async function getTsconfigFiles(rootPath: string) {
  const tsconfigPath = path.join(rootPath, "tsconfig.json");
  // 如果没有tsconfig,摆烂
  if (!fsExistsSync(tsconfigPath)) return;
  const dataChunk = await createReadStream(tsconfigPath);
  let configJson;
  try {
    configJson = JSON.parse(dataChunk as string);
  } catch (e) {
    console.log(chalk.red(`请检查 ${tsconfigPath} 文件是否符合json标准格式:${e}`));
  }
  if (configJson && configJson.files) {
    return filesFactory(rootPath, configJson.files);
  }
  await compilerOptionsFactory(rootPath, configJson.compilerOptions);
}

/**
 * 处理tsconfig.js files
 * @param files
 * @returns
 */
function filesFactory(rootPath: string, files: string[]) {
  files.map((file) => {
    needCopy.push(path.join(rootPath, file));
  });
}

/**
 * 处理rootDir
 * @param compilerOptions
 * @returns
 */
async function compilerOptionsFactory(rootPath: string, compilerOptions: ICompilerOptions) {
  const rootDir = compilerOptions ? compilerOptions.rootDir : false;
  if (!rootDir) {
    // 如果什么都没有直接给个src目录
    const workspace = path.join(rootPath, "src");
    const { filesArrs } = await getWorkspaceContext(workspace);
    return needCopy.push(...filesArrs);
  }
  // 处理非数组情况
  if (!Array.isArray(rootDir)) {
    const workspace = path.join(rootPath, rootDir);
    const { filesArrs } = await getWorkspaceContext(workspace);
    return needCopy.push(...filesArrs);
  }
  // 处理数组
  await Promise.all(
    rootDir.map(async (dir) => {
      const workspace = path.join(rootPath, dir);
      const { filesArrs } = await getWorkspaceContext(workspace);
      needCopy.push(...filesArrs);
    }),
  );
}
