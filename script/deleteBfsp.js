const fs = require('fs');
const path = require('path');
const excludePath= {
    node_modules: true,
    build: true,
    test: true,
    dist: true,
  };
/**
 * 删除某一个包下面的需要符合格式的文件。
 * @param  {String} url  文件路径，绝对路径
 * @param  {String} name 需要删除的文件名称
 * @return {Null}
 * @author huangh 20170123
 */
  const deleteFile = (url, name) => {
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

deleteFile(process.cwd(),'#bfsp.ts')
