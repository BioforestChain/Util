import path from "node:path";
import fs from "node:fs";
import { getWorkspaceContext, createReadStream, migragteFactory } from "./fileFactory";
import { getUserCmdInput, getUserCmdConfirm } from "./cli";
import os from "os";
import { indexRule, nodeRule, typeDeclareRule, typeDRule } from "./rule";

let workspaceRoot = path.join(process.cwd());
const tip = "是否要把以上文件记录下来?";
const typeFiles: string[] = []; // type类型匹配到的文件
const nodeFiles: string[] = []; // .node.ts 类型匹配到的文件
const declareFiles: string[] = []; // @types.ts 这种文件，只用来declare，不可以出现import <spe> 这样的语法
const indexFiles: string[] = []; // index.ts只允许作为入口文件

const beforeInit = async () => {
  const result = await getUserCmdConfirm(
    `此工具将会帮助您的代码风格向pkgm靠拢 ${os.EOL} 您现在是否在您的工作目录下？`,
  );
  if (result) {
    return init();
  }
  const workspaces = await getUserCmdInput("请输入您工作区的位置(相对路径)：");
  workspaceRoot = path.join(process.cwd(), workspaces);
  init();
};
beforeInit();

const init = async () => {
  const { fileDirs, filesArrs } = await getWorkspaceContext(workspaceRoot);
  fileDirs.forEach(
    async (dir, index) => await mainMigrateFactory(filesArrs[index] as string[] | string, dir),
  );
  await askDeveloperOpinion();
  console.log("风格标记结束");
};

/**
 * 给用户选择，是否把不符合pkgm的记录下来
 */
const askDeveloperOpinion = async () => {
  if (typeFiles.length !== 0) {
    console.log(typeFiles);
    const result = await getUserCmdConfirm(`${typeDRule} ${tip}`);
    if (result) {
      await migragteFactory(typeFiles)(typeDRule);
    }
  }
  if (nodeFiles.length !== 0) {
    console.log(nodeFiles);
    const result = await getUserCmdConfirm(`${nodeRule} ${tip}`);
    if (result) {
      await migragteFactory(nodeFiles,true)(nodeRule);
    }
  }
  if (declareFiles.length !== 0) {
    console.log(declareFiles);
    const result = await getUserCmdConfirm(`${typeDeclareRule} ${tip}`);
    if (result) {
      await migragteFactory(declareFiles,true)(typeDeclareRule);
    }
  }
  if (indexFiles.length !== 0) {
    console.log(indexFiles);
    const result = await getUserCmdConfirm(`${indexRule} ${tip}`);
    if (result) {
      await migragteFactory(indexFiles,true)(indexRule);
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
