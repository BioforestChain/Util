import path from "node:path";
import fs from "node:fs";
import { getWorkspaceContext, createWriteStream, createReadStream } from './fileFactory';
import { getUserCmdInput, getUserCmdConfirm } from "./cli";
import os from 'os';

let workspaceRoot = path.join(process.cwd());
const opinionFile = path.join(process.cwd(), 'opinionFile.md');
const typeFiles: string[] = []; // type类型匹配到的文件
const nodeFiles: string[] = []; // .node.ts 类型匹配到的文件
const declareFiles: string[] = []; // @types.ts 这种文件，只用来declare，不可以出现import <spe> 这样的语法

const beforeInit = async () => {
  const result = await getUserCmdConfirm(`此工具将会帮助您的代码风格向pkgm靠拢 ${os.EOL} 您现在是否在您的工作目录下？`);
  if (result) {
    return init();
  }
  const workspaces = await getUserCmdInput('请输入您工作区的位置(相对路径)：');
  workspaceRoot = path.join(process.cwd(), workspaces);
  init();
}
beforeInit();

const init = async () => {
  const {
    fileDirs,
    filesArrs
  } = await getWorkspaceContext(workspaceRoot)
  fileDirs.forEach(async (dir, index) => await mainMigrateFactory(filesArrs[index] as string[] | string, dir));
  await askDeveloperOpinion();
  console.log('风格标记结束');
}

/**
 * 给用户选择，是否把不符合pkgm的记录下来
 */
const askDeveloperOpinion = async () => {
  if (typeFiles.length !== 0) {
    console.log(typeFiles);
    const result = await getUserCmdConfirm(`以上文件不符合pkgm的*.t.ts 风格是否要把以上文件记录下来?`);
    if (result) {
      await typeMigrateFactory(typeFiles);
    }
  }
  if (nodeFiles.length !== 0) {
    console.log(nodeFiles)
    const result = await getUserCmdConfirm(`以上文件不符合pkgm的*#node.ts风格是否要把以上文件记录下来?`);
    if (result) {
      await nodeMigrateFactory(nodeFiles);
    }
  }
  if (declareFiles.length !== 0) {
    console.log(declareFiles);
    const result = await getUserCmdConfirm(`pkgm规定@types.ts 这种文件，只用来declare，不可以出现import <spe> 是否要把以上文件记录下来?`);
    if (result) {
      await declareMigrateFactory(declareFiles);
    }
  }
}

/**
 * 收集匹配规则的文件
 * @param {FileArray | File} files 
 * @param {string} dir 
 * @returns 
 */
const mainMigrateFactory = async (files:Array<string> | string, dir:string) => {
  if (!Array.isArray(files)) {
    const stat = fs.lstatSync(files);
    const is_direc = stat.isDirectory();
    // 如果是文件，直接判断规则
    if (!is_direc) {
      fileFilterFactory(files)
    }
    return;
  }
  files.map(async (fileName, index) => {
    const filesDir = path.join(dir, fileName);
    fileFilterFactory(filesDir);
  })
};

/**
 * 把记录的文件写入
 * @param {FileArray} typeFiles 
 */
const typeMigrateFactory = async (typeFiles:Array<string>) => {
  createWriteStream(opinionFile, typeFiles, '以下文件不符合pkgm的*.t.ts 风格');
}
/**
 * 把记录的文件写入
 * @param {FileArray} nodeFiles 
 */
const nodeMigrateFactory = (nodeFiles:Array<string>) => {
  createWriteStream(opinionFile, nodeFiles, '以下文件不符合pkgm的*#node.ts风格', {
    'flags': 'a'
  });
}
/**
 * 把记录的文件写入
 * @param {FileArray} declareFiles 
 */
const declareMigrateFactory = (declareFiles:Array<string>) => {
  createWriteStream(opinionFile, declareFiles, '@types.ts 这种文件，只用来declare，不可以出现import <spe>', {
    'flags': 'a'
  });
}

/**
 * 处理文件规则
 * @param {string} filesDir 
 */
const fileFilterFactory = async (filesDir:string) => {
  const fileName = path.basename(filesDir);
  if (/@type[s]?\.[t,j,m,c]s[x]?$/.test(fileName)) {
    typeFiles.push(filesDir);
    await declareFilesRule(filesDir)
  }

  if (/\.[^d]+\.[t,j,m,c]s[x]?$/.test(fileName)) {
    nodeFiles.push(filesDir);
  }
}

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
    resolve()
  })
}