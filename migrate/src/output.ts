import path from "path";
import fs from "fs";
import { excludePath, fsExistsSync, isDirectory } from "./util/fileFactory";

export const beforeInCopyFile = (pwd = process.cwd(), outputName = "pkgm") => {
  copyFile(pwd, outputName);
};

/**
 * 递归复制文件
 * @param srcPath
 * @param tarPath
 */
export const copyFile = (srcPath: string, tarPath: string) => {
  if (!fsExistsSync(tarPath)) {
    fs.mkdirSync(tarPath);
  }
  const files =  fs.readdirSync(srcPath);
  excludeCopyFile(files, srcPath, tarPath);
};

/**
 * 排除不要复制的
 * @param files 
 * @param srcPath 
 * @param tarPath 
 */
const excludeCopyFile = (files: string[], srcPath: string, tarPath: string) => {
  files.forEach(function (filename) {
    let filedir = path.join(srcPath, filename);
    if (excludePath[filename] || /(^|[\/\\])\../.test(filename)) return; // 排除不要的(ps:正则是排除开头为.的文件夹)
    if (filename === tarPath) return; // 防止递归创建文件
    fsStatus(filedir,tarPath,filename)
  });
};

/**
 * 复制文件并递归
 * @param filedir 
 * @param tarPath 
 * @param filename 
 */
const fsStatus = (filedir:string, tarPath: string,filename:string) => {
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
