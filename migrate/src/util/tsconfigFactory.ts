import path from "path";
import { ICompilerOptions } from "typings/file";
import { createReadStream, fsExistsSync, readSrcDirAllFile } from "./fileFactory";

/**这里面的内容主要是根据tsconfig构建复制树 */
/**
 *  util:[{
 * name:packages,
 * child:[
 * {name:module1,child:[{}]},
 * {name:module2,child:[{}]}
 * ],
 * }]
 */

let needCopy: any = [];
/**
 * 只迁移tsconfig中指定的有效文件，files字段，没有这个字段就用rootDir/rootDirs
 * @param rootPath 迁移文件夹的根目录
 * @param observerWorkspack bfsw路径
 * @returns
 */
export const getNeedCopyFile = async (rootPath: string, observerWorkspack: string[]) => {
  const current = path.basename(rootPath);
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
  await getTsconfigFiles(rootPath, current);
  return needCopy;
};

/**
 * 拿到里面的所有项目
 * @param childProject
 */
async function getChildTsconfig(packageProject: string) {
  const files = await readSrcDirAllFile(packageProject);
  console.log(packageProject);
  // 找到每个项目的地址
  await Promise.all(
    files.map(async (project) => {
      const childProject = path.join(packageProject, project);
      await getTsconfigFiles(childProject, project);
    }),
  );
  console.log("needCopyneedCopy:", needCopy);
}


/**
 * 拿到tsconfig
 * @param rootPath
 * @param current 当前地址
 * @returns
 */
async function getTsconfigFiles(rootPath: string, current: string) {
  const tsconfigPath = path.join(rootPath, "tsconfig.json");
  // 如果没有tsconfig,摆烂
  if (!fsExistsSync(tsconfigPath)) return;
  const dataChunk = await createReadStream(tsconfigPath);

  const configJson = JSON.parse(dataChunk as string);

  if (configJson.files) {
    return filesFactory(rootPath,configJson.files, current);
  }
  compilerOptionsFactory(configJson.compilerOptions);
}

/**
 * 处理tsconfig.js files
 * @param files
 * @returns
 */
function filesFactory(rootPath:string,files: string[], current: string) {
    console.log("Xxxx",rootPath,files,current)

}

function createBfsAst(packageProject: string, current: string) {
    const cwd = path.basename(process.cwd());
    let forders = packageProject.split(path.sep);
    const currentForders = forders.splice(forders.indexOf(cwd));
    currentForders.map((item) => {
        
    });
  }
  
/**
 * 处理rootDir
 * @param compilerOptions
 * @returns
 */
function compilerOptionsFactory(compilerOptions: ICompilerOptions) {
  const rootDir = compilerOptions.rootDir;
  if (rootDir) {
    return compilerOptions.rootDir;
  }
  return ["./src"];
}
