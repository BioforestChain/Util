import path from "node:path";
import fs from "node:fs";
import { getWorkspaceContext, createReadStream, migragteFactory } from "./fileFactory";
import { getUserCmdInput, getUserCmdConfirm } from "./cli";
import os from "os";
import { indexRule, nodeRule, typeDeclareRule, typeDRule } from "./rule";

let workspaceRoot = path.join(process.cwd());
let opinionFile = path.join(process.cwd(), 'opinionFile.md');
const tip = "是否要把以上文件记录下来?";
const typeFiles: string[] = []; // type类型匹配到的文件
const nodeFiles: string[] = []; // .node.ts 类型匹配到的文件
const declareFiles: string[] = []; // @types.ts 这种文件，只用来declare，不可以出现import <spe> 这样的语法
const indexFiles: string[] = []; // index.ts只允许作为入口文件

export const beforeInit = async (agree: boolean = false,writeFileName?:string ) => {
  if (writeFileName !== undefined) {
    opinionFile = path.join(process.cwd(), `${writeFileName}.md`);
  }
  const result = await getUserCmdConfirm(
    `此工具将会帮助您的代码风格向pkgm靠拢 ${os.EOL} 您现在是否在您的工作目录下？`,
  );
  if (result) {
    return init(agree);
  }
  const workspaces = await getUserCmdInput("请输入您工作区的位置(相对路径)：");
  workspaceRoot = path.join(process.cwd(), workspaces);
  init(agree);
};
/**用户同意自动化记录时，启用此函数 */
export const agreeRecordAllData = async (writeFileName?:string) => {
  beforeInit(true,writeFileName);
};

const init = async (agree: boolean = false) => {
  const { fileDirs, filesArrs } = await getWorkspaceContext(workspaceRoot);
  fileDirs.forEach(
    async (dir, index) => await mainMigrateFactory(filesArrs[index] as string[] | string, dir),
  );
  if (agree) {
    await askDeveloperOpinion(agree);
  } else {
    await askDeveloperOpinion();
  }
  console.log("风格标记结束");
};

/**
 * 给用户选择，是否把不符合pkgm的记录下来
 */
const askDeveloperOpinion = async (agree: boolean = false) => {
  if (typeFiles.length !== 0) {
    console.log(typeFiles);
    const result = agree ? true : await getUserCmdConfirm(`${typeDRule} ${tip}`);
    if (result) {
      await migragteFactory(typeFiles)(typeDRule,opinionFile);
    }
  }
  if (nodeFiles.length !== 0) {
    console.log(nodeFiles);
    const result = agree ? true : await getUserCmdConfirm(`${nodeRule} ${tip}`);
    if (result) {
      await migragteFactory(nodeFiles, true)(nodeRule,opinionFile);
    }
  }
  if (declareFiles.length !== 0) {
    console.log(declareFiles);
    const result = agree ? true : await getUserCmdConfirm(`${typeDeclareRule} ${tip}`);
    if (result) {
      await migragteFactory(declareFiles, true)(typeDeclareRule,opinionFile);
    }
  }
  if (indexFiles.length !== 0) {
    console.log(indexFiles);
    const result = agree ? true : await getUserCmdConfirm(`${indexRule} ${tip}`);
    if (result) {
      await migragteFactory(indexFiles, true)(indexRule,opinionFile);
    }
  }
};

/**
 * 收集匹配规则的文件
 * @param {FileArray | File} files
 * @param {string} dir
 * @returns
 */
const mainMigrateFactory = async (files: Array<string> | string, dir: string) => {
  if (!Array.isArray(files)) {
    const stat = fs.lstatSync(files);
    const is_direc = stat.isDirectory();
    // 如果是文件，直接判断规则
    if (!is_direc) {
      fileFilterFactory(files);
    }
    return;
  }
  files.map(async (fileName, index) => {
    const filesDir = path.join(dir, fileName);
    fileFilterFactory(filesDir);
  });
};

/**
 * 处理文件规则
 * @param {string} filesDir
 */
const fileFilterFactory = async (filesDir: string) => {
  const fileName = path.basename(filesDir);
  if (/@type[s]?\.[t,j,m,c]s[x]?$/.test(fileName)) {
    typeFiles.push(filesDir);
    await declareFilesRule(filesDir);
  }

  if (/\.[^d]+\.[t,j,m,c]s[x]?$/.test(fileName)) {
    nodeFiles.push(filesDir);
  }

  if (/index.ts/.test(fileName)) {
    await indexFilesRule(filesDir);
  }
};

/**
 * 处理@types.ts里有import的
 * @param {string} filesDir
 * @returns
 */
const declareFilesRule = (filesDir: string) => {
  return new Promise<void>(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/import\(.+\)/g.test(dataChunk as string)) {
      declareFiles.push(filesDir);
    }
    resolve();
  });
};

const indexFilesRule = (filesDir: string) => {
  return new Promise<void>(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/(function)/g.test(dataChunk as string)) {
      indexFiles.push(filesDir);
    }
    resolve();
  });
};
