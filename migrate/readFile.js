const path = require("node:path");
const fs = require("node:fs");

/**
 * 获取src目录下的所有文件
 * @param {path} pathName 
 * @returns Promise<path>
 */
const readSrcDirAllFile = (pathName) => {
    const srcDir = `${pathName}\\src`;
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

module.exports = {
    readSrcDirAllFile
}