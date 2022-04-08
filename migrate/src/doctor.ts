import { createReadStream, getWorkspaceContext, readSrcDirAllFile } from "./fileFactory";
import path from "path";
import os from "os";
import { watchFactory } from "./watch";
import chalk from "chalk";
import { indexRule, nodeRule, typeDeclareRule, typeDRule } from "./rule";
import { fileFilterFactory, indexFiles, nodeFiles, typeFiles, declareFiles } from "./migrate";

const log = console.log;
let workspaceRoot = process.cwd(); // 用户当前位置
let observerWorkspack: string[] = [];

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
  log(chalk.bgBlue(`${os.EOL} 开启动态对比模式： ${os.EOL}`))
  // observerWorkspack为0表示为bfsp
  if (observerWorkspack.length === 0) {
    CommondNotification();
    return;
  }
  // bfsw
  observerWorkspack.map(async (pathName) => {
    const { filesArrs } = await getWorkspaceContext(path.join(workspaceRoot, pathName));
    const resolveFn =  filesArrs.map(async (file, index) => {
      return await fileFilterFactory(file);
    });
    await Promise.all(resolveFn)
     CommondNotification();
  });
};

const CommondNotification = () => {
  if (typeFiles.length !== 0) {
    log(chalk.bold.yellow(`建议修改以下文件：${typeDRule}`));
    typeFiles.map((val) => {
      log(chalk.underline.yellow(val));
    });
  }
  if (nodeFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    log(chalk.bold.yellow(`建议修改以下文件：${nodeRule}`));
    nodeFiles.map((val) => {
      log(chalk.underline.yellow(val));
    });
  }
  if (declareFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    log(chalk.bold.red(`需要修改以下文件：${typeDeclareRule}`));
    declareFiles.map((val) => {
      log(chalk.underline.red(val));
    });
  }
  if (indexFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    log(chalk.bold.red(`需要修改以下文件：${indexRule}`));
    indexFiles.map((val) => {
      log(chalk.underline.red(val));
    });
  }
};

/**
 * 每次更改文件会触发这个函数
 * 他会检测直到迁移完成
 * @param path
 */
const react: { [key: string]: boolean } = { change: true, ready: true,unlink:true };
export const operatingRoom = async (type: string, packages: string) => {
  if (react[type]) {
    (indexFiles.length = 0),
      (nodeFiles.length = 0),
      (typeFiles.length = 0),
      (declareFiles.length = 0);
    return runDoctor();
  }
};
