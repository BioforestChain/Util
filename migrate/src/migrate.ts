import path from "node:path";
import chalk from "chalk";
import {
  getWorkspaceContext,
  migragteFactory,
  isDirectory,
  readSrcDirAllFile,
} from "./util/fileFactory";
import { getUserCmdConfirm } from "./util/cli";
import os from "os";
import {
  fileFilterFactory,
  importRule,
  indexRule,
  nodeRule,
  privateImportRule,
  typeDeclareRule,
  typeDRule,
  warringTestTypeRule,
} from "./rule";
import { judgeBfspBfsw } from "./util/judge";
import { createPkgmEntrance } from "./util/createPkgmEntrance";

const log = console.log;
let opinionFile = path.join(process.cwd(), "opinionFile.md");
const tip = "是否要把以上文件记录下来?";
export const typeFiles: string[] = []; // type类型匹配到的文件
export const nodeFiles: string[] = []; // .node.ts 类型匹配到的文件
export const declareFiles: string[] = []; // @types.ts 这种文件，只用来declare，不可以出现import <spe> 这样的语法
export const indexFiles: string[] = []; // index.ts只允许作为入口文件
export const privateImportFiles: string[] = []; //"'#'开头是pkgm私有导入的写法,不允许在旧项目出现文件名带#";
export const warringTestTypeFiles: string[] = []; // '*.test.ts在bfsp中属于测试文件';
export const importFiles: string[] = []; // impor\t mod f\rom '#mod' 这种以#开头导入的文件为pkgm语法，未迁移的项目不允许出现

/**
 *
 * @param agree 是否同意直接写入
 * @param writeFileName 自定义文件名
 * @returns
 */
export const beforeInit = async (
  agree: boolean = false,
  writeFileName?: string,
  createBfsp: boolean = false,
  workspaceRoot = process.cwd()
) => {
  // 如果用户使用了自定义文件名
  if (writeFileName !== undefined) {
    opinionFile = path.join(process.cwd(), `${writeFileName}.md`);
  }
  const observerWorkspack = await judgeBfspBfsw(workspaceRoot);
  createBfsp && createPkgmEntrance(observerWorkspack);
  //有包地址，代表是bfsw
  if (observerWorkspack.length !== 0) {
    observerWorkspack.map(async packageName => {
      workspaceRoot = path.join(workspaceRoot,packageName);
       await init(agree,workspaceRoot);
    })
    return;
  }
  // 没有包地址，代表是bfsp
  init(agree,workspaceRoot);
};

export const init = async (agree: boolean = false,workspace:string) => {
  const { fileDirs, filesArrs } = await getWorkspaceContext(workspace);
  fileDirs.forEach(
    async (dir, index) => await mainMigrateFactory(filesArrs[index] as string[] | string, dir),
  );
  // agree=true 表示用户需要全部记录下来
  if (agree) {
    await askDeveloperOpinion(agree);
  } else {
    await askDeveloperOpinion();
  }
  log("风格标记结束");
};

/**
 * 收集匹配规则的文件
 * @param {FileArray | File} files
 * @param {string} dir
 * @returns
 */
export const mainMigrateFactory = async (files: Array<string> | string, dir: string) => {
  if (!Array.isArray(files)) {
    const is_direc = isDirectory(files);
    // 如果是文件，直接判断规则
    if (!is_direc) {
      return await fileFilterFactory(files);
    }
    // 如果不是文件，只检测src目录
    const fileName = path.basename(files);
    if (fileName === "src") {
      const deepFile = await readSrcDirAllFile(files);
      await mainMigrateFactory(deepFile, path.join(dir, "src"));
    }
    return;
  }
  await Promise.all(
    files.map(async (fileName, index) => {
      const filesDir = path.join(dir, fileName);
      return await fileFilterFactory(filesDir);
    }),
  );
};

/**
 * 给用户选择，是否把不符合pkgm的记录下来
 */
export const askDeveloperOpinion = async (agree: boolean = false) => {
  let ask = false; // 用来标记是不是第一次写入，如果是第二次写入会变成true，打开插入文本模式
  await warpAsk(typeFiles,typeDRule,'yellow');
  await warpAsk(nodeFiles,nodeRule,'yellow');
  await warpAsk(indexFiles,indexRule,'blue');
  await warpAsk(warringTestTypeFiles,warringTestTypeRule,'yellow');
  await warpAsk(declareFiles,typeDeclareRule,'red');
  await warpAsk(privateImportFiles,privateImportRule,'red');
  await warpAsk(importFiles,importRule,'red');
  async function warpAsk(files: string[], rule: string, style: string) {
    if (files.length !== 0) {
      ask && log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
      ask = true;
      const chalkColor = getChalkColor(style);
      files.map((val) => {
        log(chalkColor(val));
      });
      const result = agree ? true : await getUserCmdConfirm(`${rule} ${tip}`);
      if (result) {
        await migragteFactory(files,ask)(rule, opinionFile);
      }
    }
  }
};

export const getChalkColor = (color: string) => {
  switch (color) {
    case "yellow":
      return function (text: string) {
        return chalk.underline.yellow(text);
      };
    case "red":
      return function (text: string) {
        return chalk.underline.red(text);
      };
    case "blue":
      return function (text: string) {
        return  chalk.underline.blue(text);
      };
    default:
      return function (text: string) {
        return  chalk.underline.black(text);
      };
  }
};
