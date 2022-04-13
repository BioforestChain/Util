import { createReadStream, readSrcDirAllFile } from "./fileFactory";
import path from 'path';
/**
 * 判断是bfsp还是bfsw
 * @param folder
 * @returns packages
 */
export const judgeBfspBfsw = async (folder: string) => {
  const allFile = await readSrcDirAllFile(folder);
  // 如果读取出来没有文件
  if (!Array.isArray(allFile)) {
    throw new Error("🚨目录下没有内容");
  }
  return await lernaFactory(folder, allFile);
};

/**
 * 处理有lerna的包名
 * 因为monorepo风格包名不一定是packages
 * @param folder
 * @returns packages:string[]
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
