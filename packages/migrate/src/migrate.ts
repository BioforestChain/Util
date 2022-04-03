import path from "node:path";
import {
  getWorkspaceContext,
  createReadStream,
  migragteFactory,
  isDirectory,
  readSrcDirAllFile,
} from "./fileFactory";
import { getUserCmdInput, getUserCmdConfirm } from "./cli";
import os from "os";
import { indexRule, nodeRule, typeDeclareRule, typeDRule } from "./rule";

let workspaceRoot = path.join(process.cwd());
let opinionFile = path.join(process.cwd(), "opinionFile.md");
const tip = "是否要把以上文件记录下来?";
export const typeFiles: string[] = []; // type类型匹配到的文件
export const nodeFiles: string[] = []; // .node.ts 类型匹配到的文件
export const declareFiles: string[] = []; // @types.ts 这种文件，只用来declare，不可以出现import <spe> 这样的语法
export const indexFiles: string[] = []; // index.ts只允许作为入口文件

/**
 *
 * @param agree 是否同意直接写入
 * @param writeFileName 自定义文件名
 * @param yy 是否直接同意直接在当前目录检索
 * @returns
 */
export const beforeInit = async (
  agree: boolean = false,
  writeFileName?: string,
  currentDirectory?: boolean,
) => {
  if (writeFileName !== undefined) {
    opinionFile = path.join(process.cwd(), `${writeFileName}.md`);
  }
  const result = currentDirectory
    ? true
    : await getUserCmdConfirm(
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
export const agreeRecordAllData = async (writeFileName?: string) => {
  beforeInit(true, writeFileName);
};

export const init = async (agree: boolean = false) => {
  console.log(workspaceRoot);
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
      await migragteFactory(typeFiles)(typeDRule, opinionFile);
    }
  }
  if (nodeFiles.length !== 0) {
    console.log(nodeFiles);
    const result = agree ? true : await getUserCmdConfirm(`${nodeRule} ${tip}`);
    if (result) {
      await migragteFactory(nodeFiles, true)(nodeRule, opinionFile);
    }
  }
  if (declareFiles.length !== 0) {
    console.log(declareFiles);
    const result = agree ? true : await getUserCmdConfirm(`${typeDeclareRule} ${tip}`);
    if (result) {
      await migragteFactory(declareFiles, true)(typeDeclareRule, opinionFile);
    }
  }
  if (indexFiles.length !== 0) {
    console.log(indexFiles);
    const result = agree ? true : await getUserCmdConfirm(`${indexRule} ${tip}`);
    if (result) {
      await migragteFactory(indexFiles, true)(indexRule, opinionFile);
    }
  }
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
      await fileFilterFactory(files);
    } else {
      const fileName = path.basename(files);
      if (fileName === "src") {
        const deepFile = await readSrcDirAllFile(files);
        await mainMigrateFactory(deepFile, path.join(dir, "src"));
      }
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
 * 处理文件规则
 * @param {string} filesDir
 */
export const fileFilterFactory = async (filesDir: string) => {
  const fileName = path.basename(filesDir);
  if (/@type[s]?\.[t,j,m,c]s[x]?$/.test(fileName)) {
    typeFiles.push(filesDir);
    await declareFilesRule(filesDir);
  }

  if (/\.(?!test|d)([a-z0-9]+)\.[t,j,m,c]s[x]?$/.test(fileName)) {
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
  return new Promise<boolean>(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/import\(.+\)/g.test(dataChunk as string)) {
      declareFiles.push(filesDir);
    }
    resolve(true);
  });
};

const indexFilesRule = (filesDir: string) => {
  return new Promise<boolean>(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/(function)/g.test(dataChunk as string)) {
      indexFiles.push(filesDir);
    }
    resolve(true);
  });
};
