import { Worker, isMainThread, workerData } from "worker_threads";
import { excludePath, readSrcDirAllFile, writeContext } from "./fileFactory";
import path from 'path';

const cwd = process.cwd();
export const createPkgmEntrance = (packages: string[]) => {
  new Worker(__filename, { workerData: packages }); // 创建子进程，去生成入口文件
};

export const createBfsp = (paths?:string[],packageName?:string) => {
    // 没有传入路径，表明在一个单独的项目里
    if(!paths) {
        writeContext(path.join(cwd,'#bfsp.ts'),__returnBfspContext( path.basename(cwd)));
        return;
    }
    // 不在单独的项目里，需要给多个项目加#bfsp.ts文件
    paths.forEach(async (project) => writeContext(path.join(cwd, packageName!, project, '#bfsp.ts'),__returnBfspContext(project)))
};

export const createBfsw = async (packages: string[]) => {
  packages.forEach(async (packName) => {
    let writeBfsps = await readSrcDirAllFile(packName);
    writeBfsps = writeBfsps.filter((name) => {
    return !excludePath[name]
    });
    createBfsp(writeBfsps,packName)
  });
 await writeContext(path.join(cwd,'#bfsw.ts'), __returnBfswContext());
};

/**
 * 子线程入口
 * @param isTest 测试模拟子线程的时候传true
 */
export const init = (isTest = false) => {
  if (!isMainThread || isTest) {
    // 子进程去处理写文件的逻辑
    const packages = workerData;
    if (packages && packages.length !== 0) {
      createBfsw(packages);
    } else {
      createBfsp();
    }
  }
}
init()
function __returnBfspContext(name: string) {
  const bfsp = `
import { defineConfig } from "@bfchain/pkgm-bfsp";
export default defineConfig((info) => {
  const config: Bfsp.UserConfig = {
    name: "${name}",
    exports: {
      ".": "./index.ts",
    },
    packageJson: {
      license: "MIT",
      author: "BFChainer",
    },
  };
  return config;
});
`;
  return bfsp;
}
function __returnBfswContext() {
  const bfsw = `
import { defineWorkspace } from "@bfchain/pkgm-bfsw";
export default defineWorkspace(() => {
  const config: Bfsw.Workspace = {
    projects: [],
  };
  return config;
});
`;
  return bfsw;
}
