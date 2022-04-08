import path from "node:path";
import * as fs from "fs";
import os from "os";
import { IWriteStreamFlag } from "typings/file";

/**
 * 写入文件
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
export const createReadStream = (path: string): Promise<string | Buffer> => {
  return new Promise((resolve, reject) => {
    const out = fs.createReadStream(path);
    out.setEncoding("utf8");
    out.on("data", (dataChunk) => {
      out.on("end", () => {
        return resolve(dataChunk);
      });
    });

    out.once("error", (err) => {
      reject(err);
    });
  });
};

/**
 * 替换文件名
 * @param {oldFileName } oldFile
 * @param {newFileName} newFile
 * @returns Promise<Boolean>
 */
export const reFileNameFactory = (oldFile: string, newFile: string) => {
  return new Promise((resolve, reject) => {
    fs.rename(oldFile, newFile, (err) => {
      if (err) {
        reject(false);
        throw err;
      }
      resolve(true);
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

const excludePath:{[key:string]:boolean} = {
  "node_modules": true,
  "build": true,
  "test": true,
  "dist": true,
}
/**
 * 获取src工作区下的所有文件
 * @param {*} workspaceRoot
 * @returns
 */
export const getWorkspaceContext = async (workspaceRoot: string) => {
  if (!fsExistsSync(workspaceRoot)) {
    throw new Error("工作目录不存在");
  }
  const filesArrs: string[]= [],
    fileDirs: string[] = [];
  async function deepWorkspace(folderAddress:string) {
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
  await deepWorkspace(workspaceRoot)
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
