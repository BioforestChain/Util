import { excludePath, readSrcDirAllFile, writeContext } from "./fileFactory";
import path from "path";
import { createBfspContext, createBfswContext } from "./createDependencies";

export const createPkgmEntrance = async (packages: string[], workspace: string) => {
  if (packages && packages.length !== 0) {
    await createBfsw(packages, workspace);
  } else {
    await createBfsp(workspace);
  }
};

/**
 *
 * @param workspace 创建目录地址
 * @param paths 需要创建bfsp的项目文件名，如果是数组则是bfsw来的
 * @param packageName lerna.json 里的packages
 * @returns
 */
export const createBfsp = async (workspace: string, paths?: string[], packageName?: string) => {
  // 没有传入路径，表明在一个单独的项目里
  if (!paths) {
    await writeContext(path.join(workspace, "#bfsp.ts"), await createBfspContext(workspace));
    return;
  }
  // 不在单独的项目里，需要给多个项目加#bfsp.ts文件
  paths.forEach(async (project) =>
    writeContext(
      path.join(workspace, packageName!, project, "#bfsp.ts"),
      await createBfspContext(workspace, packageName!, project),
    ),
  );
};

/**
 * 创建bfsw
 * @param packages
 * @param workspace
 */
export const createBfsw = async (packages: string[], workspace: string) => {
  packages.forEach(async (packName) => {
    let writeBfsps = await readSrcDirAllFile(path.join(workspace, packName));
    writeBfsps = writeBfsps.filter((name) => {
      return !excludePath[name];
    });
    await createBfsp(workspace, writeBfsps, packName);
  });
  await writeContext(path.join(workspace, "#bfsw.ts"), createBfswContext());
};
