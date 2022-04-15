import { Worker, isMainThread, workerData } from "worker_threads";
import { excludePath, readSrcDirAllFile, writeContext } from "./fileFactory";
import path from 'path';
import { createBfspContext, createBfswContext } from "./createDependencies";

export const createPkgmEntrance = (packages: string[],workspace:string) => {
  new Worker(__filename, { workerData: {packages,workspace} }); // 创建子进程，去生成入口文件
};

/**
 * 
 * @param workspace 创建目录地址
 * @param paths 需要创建bfsp的项目文件名，如果是数组则是bfsw来的
 * @param packageName lerna.json 里的packages
 * @returns 
 */
export const createBfsp = (workspace:string,paths?:string[],packageName?:string) => {
    // 没有传入路径，表明在一个单独的项目里
    if(!paths) {
        writeContext(path.join(workspace,'#bfsp.ts'),createBfspContext( path.basename(workspace)));
        return;
    }
    // 不在单独的项目里，需要给多个项目加#bfsp.ts文件
    paths.forEach(async (project) => writeContext(path.join(workspace, packageName!, project, '#bfsp.ts'),createBfspContext(project)))
};

/**
 * 创建bfsw
 * @param packages 
 * @param workspace 
 */
export const createBfsw = async (packages: string[],workspace:string) => {
  packages.forEach(async (packName) => {
    let writeBfsps = await readSrcDirAllFile(path.join(workspace,packName));
    writeBfsps = writeBfsps.filter((name) => {
    return !excludePath[name]
    });
    createBfsp(workspace,writeBfsps,packName);
  });
 await writeContext(path.join(workspace,'#bfsw.ts'), createBfswContext());
};

/**
 * 子线程入口
 * @param testWorkspace 测试模拟子线程的时候传地址
 */
export const init = (testWorkspace = '') => {
  if (!isMainThread) {
    // 子进程去处理写文件的逻辑
    const {packages,workspace} = workerData;
    if (packages && packages.length !== 0) {
      createBfsw(packages,workspace);
    } else {
      createBfsp(workspace);
    }
  }
  if (testWorkspace) {
    return createBfsp(testWorkspace)
  }
}
init()
