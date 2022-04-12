import path from "node:path";
import * as fs from "fs";
import os from "os";
import { unlink } from "fs/promises";
import { IWriteStreamFlag } from "typings/file";

export const excludePath: { [key: string]: boolean } = {
  node_modules: true,
  build: true,
  test: true,
  dist: true,
  coverage:true
};

/**
 * 创建文件并写入内容
 * @param path
 * @param writeData
 * @returns
 */
export const writeContext = (path: string, writeData: string) => {
  return new Promise((resolve, reject) => {
    const input = fs.createWriteStream(path, { encoding: "utf8" });
    input.write(writeData, () => {});
    input.end("", () => {
      resolve(true);
    });
    input.once("error", (err) => {
      reject(err);
    });
  });
};

/**
 * 把匹配的规则写入文件
 * @param {*} path
 * @param {*} data
 * @returns promise<Booblean>
 */
export const createWriteStream = (
  path: string,
  data: string[],
  title: string,
  flag?: IWriteStreamFlag,
) => {
  return new Promise((resolve, reject) => {
    let writeData = `${os.EOL} ## ${title} ${os.EOL} \`\`\``;
    if (data.length !== 0) {
      data.map((val) => {
        writeData += `${os.EOL} ${val}`;
      });
    }
    const option = Object.assign({}, flag, {
      encoding: "utf8",
    });
    const input = fs.createWriteStream(path, option);

    input.write(writeData, () => {});

    input.end(`${os.EOL} \`\`\` ${os.EOL}`, () => {
      resolve(true);
    });
    input.once("error", (err) => {
      reject(err);
    });
  });
};

/**
 * 读取文件内容
 * @param {*} path
 * @returns
 */
export const createReadStream = (FilePath: string): Promise<string | Buffer> => {
  return new Promise((resolve, reject) => {
    // 规范化路径，不然会出现系统不同，识别不到的问题
    const out = fs.createReadStream(path.normalize(FilePath));
    out.setEncoding("utf8");
    out.on("data", (dataChunk) => {
      return resolve(dataChunk);
    });
    out.on("readable", () => {
      // 如果是空文件
      if (out.read() === null) {
        return resolve("");
      }
    });
    out.on("error", (err) => {
      reject(err);
    });
  });
};

/**
 * 获取目录下的所有文件
 * @param {path} pathName
 * @returns Promise<path>
 */
export const readSrcDirAllFile = (srcDir: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(srcDir, function (err, files) {
      if (err !== null) {
        return reject(err);
      }
      return resolve(files);
    });
  });
};

/**
 * 获取src工作区下的所有文件
 * @param {*} workspaceRoot
 * @returns
 */
export const getWorkspaceContext = async (workspaceRoot: string) => {
  const filesArrs: string[] = [],
  fileDirs: string[] = [];
  if (!fsExistsSync(workspaceRoot)) {
    return {
      fileDirs,
      filesArrs,
    };
  }
  async function deepWorkspace(folderAddress: string) {
    for (const pathName of fs.readdirSync(folderAddress)) {
      const fileAddress = path.join(folderAddress, pathName);
      if (excludePath[pathName] || /(^|[\/\\])\../.test(pathName)) continue; // 排除不要的(ps:正则是排除开头为.的文件夹)
      if (isDirectory(fileAddress)) {
        await deepWorkspace(path.join(fileAddress));
        continue;
      }
      // 依赖收集
      if (/\.ts$/.test(fileAddress)) {
        fileDirs.push(folderAddress);
        filesArrs.push(fileAddress);
      }
    }
  }
  await deepWorkspace(workspaceRoot);
  return {
    fileDirs,
    filesArrs,
  };
};

/**检测文件或者文件夹存在 */
export const fsExistsSync = (path: string) => {
  try {
    fs.accessSync(path);
  } catch (e) {
    return false;
  }
  return true;
};

/** 判断是不是文件夹 */
export const isDirectory = (path: string) => {
  const stat = fs.lstatSync(path);
  return stat.isDirectory();
};

/**
 * 写文件的适配器
 * @param typeFiles
 * @param insert
 * @returns
 */
export const migragteFactory = (typeFiles: string[], insert = false) => {
  return async function (opinion: string, opinionFile: string) {
    if (insert) {
      await createWriteStream(opinionFile, typeFiles, opinion, { flags: "a" });
    } else {
      await createWriteStream(opinionFile, typeFiles, opinion);
    }
  };
};

/**
 * 删除某一个包下面的需要符合格式的文件。
 * @param  {String} url  文件路径，绝对路径
 * @param  {String} name 需要删除的文件名称
 * @return {Null}
 * @author huangh 20170123
 */
export const deleteFile = (url: string, name: string) => {
    //判断给定的路径是否存在
    for(const file of fs.readdirSync(url)) {
      const curPath = path.join(url, file);
      // 排除目录
      if (excludePath[file] || /(^|[\/\\])\../.test(file)) continue;
        if (fs.statSync(curPath).isDirectory()) {
          //同步读取文件夹文件，如果是文件夹，则函数回调
          deleteFile(curPath, name);
        } else {
          if (file === name) {
            //是指定文件，则删除
           process.nextTick(() => {
            fs.unlinkSync(curPath);
           })
          }
        }
    }
}

/**
 * 删除某个文件
 * @param url 
 */
export const deleteOneFile = (url:string) => {
  if (fsExistsSync(url)) {
    unlink(url);
  }
}