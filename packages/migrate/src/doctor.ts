import { createReadStream, getWorkspaceContext, readSrcDirAllFile } from "./fileFactory";
import path from "path";
import { watchFactory } from "./watch";
import chalk from 'chalk';
import { indexFiles, mainMigrateFactory, nodeFiles } from "./migrate";

const log = console.log;
let workspaceRoot = process.cwd(); // 用户当前位置
let observerWorkspack:string[] = [];

const judgeBfspBfsw = async (folder: string) => {

  const allFile = await readSrcDirAllFile(folder);
  // 如果读取出来没有文件
  if (!Array.isArray(allFile)) {
    throw new Error("🚨目录下没有内容");
  }

  observerWorkspack = await lernaFactory(folder, allFile);
  watchFactory(folder, observerWorkspack); // 观察所有packages位置

  // 如果packagesNames没有东西 锁定为bfsp
  if (observerWorkspack.length !== 0) return;
  watchFactory(folder); // 没有packages观察当前目录
};
judgeBfspBfsw(workspaceRoot);

/**
 * 处理有lerna的包名
 * 因为monorepo风格包名不一定是packages
 * @param folder
 */
const lernaFactory = async (folder: string, allFile: string[]) => {
  let lernas: string[] | string = [];
  await Promise.all(
    allFile.map(async (fileOrFolder) => {
      // 如果有lerna，锁定为Bfsw,并找出包名
      if (fileOrFolder === "lerna.json") {
        lernas = await identifyLerna(folder);
      }
    }),
  );
  return lernas;
};

/**
 * 提前包名，拼接包地址
 * @param folder 
 * @returns 
 */
const identifyLerna = async (folder: string) => {
  const lerna = await createReadStream(path.join(folder, "lerna.json"));
  const jsonLerna = JSON.parse(lerna as string);
  const packagesNames = jsonLerna["packages"];
  if (!Array.isArray(packagesNames)) {
    return packagesNames.match(/\b[A-Za-z]+\b/)[0];
  }
  const names: string[] = [];
  packagesNames.forEach((name) => {
    names.push(name.match(/\b[A-Za-z]+\b/)[0]);
  });
  return names;
};


const runDoctor = async () => {
  console.log("observerWorkspack:",observerWorkspack)
  // observerWorkspack为0表示为bfsp
   if (observerWorkspack.length === 0) {
     
    return;
   }
   // bfsw
   observerWorkspack.map(async pathName => {
    const { fileDirs, filesArrs } = await getWorkspaceContext(path.join(workspaceRoot,pathName));
    console.log(fileDirs)
    await Promise.all( fileDirs.map(
     async (dir, index) => await mainMigrateFactory(filesArrs[index] as string[] | string, dir),
   ))
   console.log(indexFiles,nodeFiles)
   })


};

/**
 * 每次更改文件会触发这个函数
 * 他会检测直到迁移完成
 * @param path
 */
export const operatingRoom = async (packages: string,ready:boolean = false) => {
  if(ready) return runDoctor()
};
