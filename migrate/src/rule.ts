import path from "node:path";
import { createReadStream } from "./util/fileFactory";
import {
  declareFiles,
  indexFiles,
  nodeFiles,
  privateImportFiles,
  typeFiles,
  warringTestTypeFiles,
  importFiles,
} from "./migrate";

export const typeDRule = "警告项：*@types.ts相对应pkgm的代码风格，就是 *.type.ts 文件";
export const typeDeclareRule =
  "禁止项： @types.ts 这种文件，只能用来declare，不可以出现import * from * ";
export const nodeRule = "警告项：.node.ts 或者 .web.ts类型应该定义为*#node.ts 与 *#web.ts";
export const indexRule = "建议项：index.ts只允许作为入口文件";
export const importRule =
  "禁止项：import mod fr/om '#mod' 这种以#开头导入的文件为pkgm语法，未迁移的项目不允许出现";
export const privateImportRule = "禁止项：'#'开头是pkgm私有导入的写法,不允许在旧项目出现文件名带#";
export const warringTestTypeRule = "警告项：*.test.ts在bfsp中属于测试文件";

/**
 * 处理文件规则
 * @param {string} filesDir
 */
export const fileFilterFactory = async (filesDir: string) => {
  return new Promise(async (resolve) => {
    const fileName = path.basename(filesDir);
    // 匹配@types.ts
    if (/\w*@type[s]?\.[t,j,m,c]s[x]?$/.test(fileName)) {
      typeFiles.push(filesDir);
      await declareFilesRule(filesDir);
    }
    // 匹配*.node.ts 排除 *.test.ts/*.d.ts/*.type.ts
    if (/\.(?!test|d|type)([a-z0-9]+)\.[t,j,m,c]s[x]?$/.test(fileName)) {
      nodeFiles.push(filesDir);
    }
    // 匹配mod#web.ts
    if (/(?!#bfsw|#bfsp)(\w*#+\w*)\.[t,j,m,c]s[x]?$/.test(fileName)) {
      privateImportFiles.push(filesDir);
    }

    // 匹配*.test.ts/*.type.ts
    if (/\.(test|type)\.[t,j,m,c]s[x]?$/.test(fileName)) {
      warringTestTypeFiles.push(filesDir);
    }

    if (/index\.ts/.test(fileName)) {
      await indexFilesRule(filesDir);
    }

    // impo/rt mod fr/om '\#mod' 这种以#开头导入的文件为pkgm语法
    await importFilesRule(filesDir);
    resolve(filesDir);
  });
};

/**
 * 处理imp/ort mod f/rom '#mod'
 * @param filesDir
 * @returns
 */
const importFilesRule = async (filesDir: string) => {
  return new Promise<boolean>(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/import\s+.+\s+from\s{1}('#+\w+'|"#+\w+")/.test(dataChunk as string)) {
      importFiles.push(filesDir);
    }
    resolve(true);
  });
};

/**
 * 处理@types.ts里有import * from *的
 * @param {string} filesDir
 * @returns
 */
const declareFilesRule = async (filesDir: string) => {
  return new Promise<boolean>(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/import\s+.+\s+from\s{1}(".+"|'.+')/.test(dataChunk as string)) {
      declareFiles.push(filesDir);
    }
    resolve(true);
  });
};

/**
 * 处理index规则
 * @param filesDir 
 * @returns 
 */
const indexFilesRule = async (filesDir: string) => {
  return new Promise<boolean>(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/function\s/g.test(dataChunk as string)) {
      indexFiles.push(filesDir);
    }
    resolve(true);
  });
};
