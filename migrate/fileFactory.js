const path = require("node:path");
const fs = require("node:fs");
const os = require('os');

/**
 * 写入文件
 * @param {*} path 
 * @param {*} data 
 * @returns promise<Booblean>
 */
const createWriteStream = (path, data, title, flag) => {
    return new Promise((resolve, reject) => {
        let writeData = `${os.EOL} ${title} ${os.EOL}`;
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

        input.end(`${os.EOL} ------------------------- ${os.EOL}`, () => {
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
const createReadStream = (path) => {
    return new Promise((resolve, reject) => {
        const out = fs.createReadStream(path);
        out.setEncoding('utf8');
        out.on('data', (dataChunk) => {
            out.on('end', () => {
              resolve(dataChunk);
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
const reFileNameFactory = (oldFile, newFile) => {
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
 * 获取src目录下的所有文件
 * @param {path} pathName 
 * @returns Promise<path>
 */
const readSrcDirAllFile = (srcDir) => {
    return new Promise((resolve, reject) => {
        fs.access(srcDir, function (err) {
            if (err) {
                return resolve([])
            }
            if (!err) {
                fs.readdir(srcDir, function (err, files) {
                    if (err !== null) {
                        return reject(err);
                    }
                    return resolve(files)
                })
            }
        })

    })
}

const getWorkspaceRoot = async (workspaceRoot) => {
    const filesArrs = [],
        fileDirs = [];
    for (const item of fs.readdirSync(workspaceRoot)) {
        const projectRoot = path.join(workspaceRoot, item);
        const srcDir = path.join(projectRoot, "src");
        fileDirs.push(srcDir);
        filesArrs.push(await readSrcDirAllFile(srcDir));
    }
    return {
        fileDirs,
        filesArrs
    };
}

module.exports = {
    createWriteStream,
    createReadStream,
    getWorkspaceRoot,
    readSrcDirAllFile,
    reFileNameFactory
}