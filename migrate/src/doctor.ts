import { getWorkspaceContext } from "./util/fileFactory";
import path from "path";
import os from "os";
import { watchFactory } from "./watch";
import { judgeBfspBfsw } from "./util/judge";
import chalk from "chalk";
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
import {
  indexFiles,
  nodeFiles,
  typeFiles,
  declareFiles,
  privateImportFiles,
  warringTestTypeFiles,
  importFiles,
} from "./migrate";
import { beforeInCopyFile } from "./util/output";
import { getUnderlineColor } from "./util/cli";
import { createPkgmEntrance } from "./util/createPkgmEntrance";
import { adapterTui,attachData, InitAttachData } from "./util/terminalUI";

let workspaceRoot = process.cwd(); // 用户当前位置
let observerWorkspack: string[] = [];
let fileCount = 0;


export const warpWatchFactory = async (folder: string = "pkgm") => {
  // 判断是bfsp还是bfsw
  const observerWorkspack = await judgeBfspBfsw(workspaceRoot);
  // 创建新文件
  await beforeInCopyFile(workspaceRoot, folder, observerWorkspack);
  //把工作目录转移为新目录
  workspaceRoot = path.join(workspaceRoot, folder);
  // 创建bfsw和bfsp
  createPkgmEntrance(observerWorkspack, workspaceRoot);
  //如果有东西 锁定为bfsw
  if (observerWorkspack.length !== 0) {
    return watchFactory(folder, observerWorkspack); // 观察所有packages位置
  }
  //如果没有东西 锁定为bfsp
  watchFactory(folder); // 没有packages观察当前目录
};

const runDoctor = async () => {
  // observerWorkspack为0表示为bfsp
  if (observerWorkspack.length === 0) {
    const { filesArrs } = await getWorkspaceContext(workspaceRoot);
    fileCount = filesArrs.length;
    const resolveFn = filesArrs.map(async (file, index) => {
      return await fileFilterFactory(file);
    });
    await Promise.all(resolveFn);
    CommondNotification();
    return;
  }
  // bfsw
  observerWorkspack.map(async (pathName) => {
    const { filesArrs } = await getWorkspaceContext(path.join(workspaceRoot, pathName));
    fileCount = filesArrs.length;
    const resolveFn = filesArrs.map(async (file, index) => {
      return await fileFilterFactory(file);
    });
    await Promise.all(resolveFn);
    CommondNotification();
  });
};

/**
 * 渲染到terminal
 */
const CommondNotification = () => {
  let logContext = '';
  InitAttachData();

  warpNotification(typeFiles, typeDRule, "yellow");
  warpNotification(nodeFiles, nodeRule, "yellow");
  warpNotification(indexFiles, indexRule, "blue");
  warpNotification(warringTestTypeFiles, warringTestTypeRule, "yellow");
  warpNotification(declareFiles, typeDeclareRule, "red");
  warpNotification(importFiles, importRule, "red");
  warpNotification(privateImportFiles, privateImportRule, "red");

  function warpNotification(Files: string[], rule: string, color: string) {
    if (Files.length !== 0) {
      createAttachData(Files.length,color); 
      const chalkColor = getUnderlineColor(color);
      logContext = `${logContext}${os.EOL}${rule}${os.EOL}`;
      Files.map((file) => {
        logContext = `${logContext}${chalkColor(file)}${os.EOL}`;
      });
    }
  }
  if (logContext !== '') {
    adapterTui(logContext,attachData)
  }
};

/**
 * 每次更改文件会触发这个函数
 * 他会检测直到迁移完成
 * @param path
 */
const react: { [key: string]: boolean } = { change: true, ready: true, unlink: true };
export const operatingRoom = async (type: string, packages: string | Error) => {
  if (react[type]) {
    (indexFiles.length = 0),
      (nodeFiles.length = 0),
      (typeFiles.length = 0),
      (declareFiles.length = 0),
      (warringTestTypeFiles.length = 0),
      (privateImportFiles.length = 0),
      (importFiles.length = 0);
    return runDoctor();
  }
};


 /**预处理修改进度数据 */
 function createAttachData(filesNumber:number,color:string) {
   const percent  = attachData[color].percent;
  if (percent === 0) {
    attachData[color].percent = Math.round((filesNumber/fileCount)*100)/100
  }
  attachData[color].percent = Math.round(((percent+ filesNumber)/fileCount)*100)/100
}