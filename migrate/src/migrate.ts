import path from "node:path";
import chalk from "chalk";
import {
  getWorkspaceContext,
  migragteFactory,
  isDirectory,
  readSrcDirAllFile,
} from "./fileFactory";
import { getUserCmdInput, getUserCmdConfirm } from "./cli";
import os from "os";
import { fileFilterFactory, importRule, indexRule, nodeRule, privateImportRule, typeDeclareRule, typeDRule, warringTestTypeRule } from "./rule";

const log = console.log;
let workspaceRoot = path.join(process.cwd());
let opinionFile = path.join(process.cwd(), "opinionFile.md");
const tip = "是否要把以上文件记录下来?";
export const typeFiles: string[] = []; // type类型匹配到的文件
export const nodeFiles: string[] = []; // .node.ts 类型匹配到的文件
export const declareFiles: string[] = []; // @types.ts 这种文件，只用来declare，不可以出现import <spe> 这样的语法
export const indexFiles: string[] = []; // index.ts只允许作为入口文件
export const privateImportFiles: string[] = []; //"'#'开头是pkgm私有导入的写法,不允许在旧项目出现文件名带#";
export const warringTestTypeFiles:string[] = []; // '*.test.ts在bfsp中属于测试文件';
export const importFiles:string[] = []; // import mod from '#mod' 这种以#开头导入的文件为pkgm语法，未迁移的项目不允许出现

/**
 *
 * @param agree 是否同意直接写入
 * @param writeFileName 自定义文件名
 * @param currentDirectory 是否直接同意直接在当前目录检索
 * @returns
 */
export const beforeInit = async (
  agree: boolean = false,
  writeFileName?: string,
  currentDirectory?: boolean,
) => {
  // 如果用户使用了自定义文件名
  if (writeFileName !== undefined) {
    opinionFile = path.join(process.cwd(), `${writeFileName}.md`);
  }
  // 用户在命令行直接同意在当前目录检索，则不再询问用户
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
  const { fileDirs, filesArrs } = await getWorkspaceContext(workspaceRoot);
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
 const askDeveloperOpinion = async (agree: boolean = false) => {
   // todo .... 需要优化
  if (typeFiles.length !== 0) {
    typeFiles.map((val) => {
      log(chalk.underline.yellow(val));
    });
    const result = agree ? true : await getUserCmdConfirm(`${typeDRule} ${tip}`);
    if (result) {
      await migragteFactory(typeFiles)(typeDRule, opinionFile);
    }
  }
  if (nodeFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    nodeFiles.map((val) => {
      log(chalk.underline.yellow(val));
    });
    const result = agree ? true : await getUserCmdConfirm(`${nodeRule} ${tip}`);
    if (result) {
      await migragteFactory(nodeFiles, true)(nodeRule, opinionFile);
    }
  }
  if (indexFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    indexFiles.map((val) => {
      log(chalk.underline.blue(val));
    });
    const result = agree ? true : await getUserCmdConfirm(`${indexRule} ${tip}`);
    if (result) {
      await migragteFactory(indexFiles, true)(indexRule, opinionFile);
    }
  }
  if (privateImportFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    privateImportFiles.map((val) => {
      log(chalk.underline.blue(val));
    });
    const result = agree ? true : await getUserCmdConfirm(`${privateImportRule} ${tip}`);
    if (result) {
      await migragteFactory(privateImportFiles, true)(privateImportRule, opinionFile);
    }
  }
  if (declareFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    declareFiles.map((val) => {
      log(chalk.underline.red(val));
    });
    const result = agree ? true : await getUserCmdConfirm(`${typeDeclareRule} ${tip}`);
    if (result) {
      await migragteFactory(declareFiles, true)(typeDeclareRule, opinionFile);
    }
  }
  if (warringTestTypeFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    warringTestTypeFiles.map((val) => {
      log(chalk.underline.red(val));
    });
    const result = agree ? true : await getUserCmdConfirm(`${warringTestTypeRule} ${tip}`);
    if (result) {
      await migragteFactory(warringTestTypeFiles, true)(warringTestTypeRule, opinionFile);
    }
  }
  if (importFiles.length !== 0) {
    log(chalk.blackBright(`${os.EOL}-----------我是分割线-------------${os.EOL}`));
    importFiles.map((val) => {
      log(chalk.underline.red(val));
    });
    const result = agree ? true : await getUserCmdConfirm(`${importRule} ${tip}`);
    if (result) {
      await migragteFactory(importFiles, true)(importRule, opinionFile);
    }
  }
};