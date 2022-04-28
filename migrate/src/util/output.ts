import chalk from "chalk";
import fs from "fs";
import ora from "ora";
import path from "path";
import { fsExistsSync, isDirectory } from "./fileFactory";
import { getNeedCopyFile } from "./tsconfigFactory";

let copyTree: string[];
const log = console.log;
/**
 *
 * @param pwd 当前目录
 * @param outputName 要创建的文件夹名称
 * @param observerWorkspack 判断是不是bfsw
 */
export const beforeInCopyFile = async (
  pwd: string,
  outputName: string,
  observerWorkspack: string[],
) => {
  const spinner = ora("正在迁移文件夹").start();
  spinner.color = "yellow";

  const outputDir = path.join(pwd, outputName);
  // 拿出需要复制的文件
  copyTree = await getNeedCopyFile(pwd, observerWorkspack);
  if (Object.keys(copyTree).length === 0) {
    log(chalk.red(`${pwd}没有需要复制的文件`));
  }
  await copyFile(pwd, outputDir);
  spinner.succeed("迁移完成");
};

/**
 * 递归复制文件
 * @param srcPath
 * @param tarPath
 */
async function copyFile(srcPath: string, outputDir: string) {
  if (!fsExistsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const files = fs.readdirSync(srcPath);
  excludeCopyFile(files, srcPath, outputDir);
}

/**
 * 排除不要复制的
 * @param files
 * @param srcPath
 * @param tarPath
 */
function excludeCopyFile(files: string[], srcPath: string, tarPath: string) {
  files.forEach(function (filename) {
    const filedir = path.join(srcPath, filename);
    // 如果没有包含在需要复制的文件里
    if (!includeFile(copyTree, filename)) return;
    fsStatus(filedir, tarPath, filename);
  });
}

/**
 * 复制文件并递归
 * @param filedir
 * @param tarPath
 * @param filename
 */
function fsStatus(filedir: string, tarPath: string, filename: string) {
  if (!isDirectory(filedir)) {
    // 复制文件
    const destPath = path.join(tarPath, filename);
    fs.copyFileSync(filedir, destPath);
  } else {
    // 创建文件夹
    let tarFiledir = path.join(tarPath, filename);
    if (!fsExistsSync(tarPath)) {
      fs.mkdirSync(tarFiledir);
    }
    copyFile(filedir, tarFiledir); // 递归
  }
}

function includeFile(copyArr: string[], current: string) {
  if (!copyArr) return false;
  for (const file of copyArr) {
    if (file.indexOf(current) !== -1) {
      return true;
    }
  }
  return false;
}
