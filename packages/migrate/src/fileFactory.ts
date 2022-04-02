import path from 'node:path';
import * as fs from 'fs';
import os from 'os';
import { IWriteStreamFlag } from 'typings/file';

/**
 * 写入文件
 * @param {*} path 
 * @param {*} data 
 * @returns promise<Booblean>
 */
export const createWriteStream = (path: string, data:string[], title:string, flag?: IWriteStreamFlag) => {
    return new Promise((resolve, reject) => {
        let writeData = `${os.EOL} ## ${title} ${os.EOL} \`\`\``;
        if (data.length !== 0) {
            data.map((val) => {
                writeData += `${os.EOL} ${val}`;
            })
        }
        const option = Object.assign({}, flag, {
            encoding: "utf8"
        })
        const input = fs.createWriteStream(path, option);

        input.write(writeData, () => {})

        input.end(`${os.EOL} \`\`\` ${os.EOL}`, () => {
            resolve(true);
        })
        input.once('error', (err) => {
            reject(err)
        })
    })
}

/**
 * 读取文件内容
 * @param {*} path 
 * @returns 
 */
export const createReadStream = (path: string):Promise<string| Buffer> => {
    return new Promise((resolve, reject) => {
        const out = fs.createReadStream(path);
        out.setEncoding('utf8');
        out.on('data', (dataChunk) => {
            out.on('end', () => {
                return resolve(dataChunk);
            })
        })

        out.once('error', (err) => {
            reject(err);
        })
    })
}

/**
 * 替换文件名
 * @param {oldFileName } oldFile 
 * @param {newFileName} newFile 
 * @returns Promise<Boolean>
 */
export const reFileNameFactory = (oldFile:string, newFile:string) => {
    return new Promise((resolve, reject) => {
        fs.rename(oldFile, newFile, (err) => {
            if (err) {
                reject(false);
                throw err;
            };
            resolve(true);
        });
    })
}

/**
 * 获取目录下的所有文件
 * @param {path} pathName 
 * @returns Promise<path>
 */
export const readSrcDirAllFile = (srcDir:string):Promise<string[]> => {
    return new Promise((resolve, reject) => {
        fs.readdir(srcDir, function (err, files) {
            if (err !== null) {
                return reject(err);
            }
            return resolve(files)
        })
    })
}

/**
 * 获取src工作区下的所有文件
 * @param {*} workspaceRoot 
 * @returns 
 */
export const getWorkspaceContext = async (workspaceRoot:string) => {
    if(!fsExistsSync(workspaceRoot)) {
       throw new Error('工作目录不存在');
    }
    const filesArrs = [],
        fileDirs = [];
    for (const item of fs.readdirSync(workspaceRoot)) {
        const projectRoot = path.join(workspaceRoot, item);
        const srcDir = path.join(projectRoot, "src");
        if (fsExistsSync(srcDir)) {
            fileDirs.push(srcDir);
            filesArrs.push(await readSrcDirAllFile(srcDir));
        } else {
            fileDirs.push(workspaceRoot);
            filesArrs.push(projectRoot);
        }
    }
    return {
        fileDirs,
        filesArrs
    };
}

/**检测文件或者文件夹存在 */
export const fsExistsSync = (path:string) => {
    try{
        fs.accessSync(path);
    }catch(e){
        return false;
    }
    return true;
}

/** 判断是不是文件夹 */
export const isDirectory = (path:string) => {
    const stat = fs.lstatSync(path);
    return stat.isDirectory();
}


export const migragteFactory = (typeFiles: string[],insert = false) => {
    return async function(opinion:string,opinionFile:string) {
        if (insert) {
            await createWriteStream(opinionFile, typeFiles, opinion,{"flags":"a"});
        } else {
            await createWriteStream(opinionFile, typeFiles, opinion);
        }
    }
}
