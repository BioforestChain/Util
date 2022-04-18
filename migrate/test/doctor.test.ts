import path from 'path';
import { judgeBfspBfsw } from '../src/util/judge';
import * as createPkgm from '../src/util/createPkgmEntrance';
import fs from 'fs';

const bfswPath = path.join(process.cwd(),'test', "bfsw");
const bfspPath = path.join(process.cwd(),'test',"bfsp");


test(`test 自动判断是bfsp`,async () =>{
    expect((await judgeBfspBfsw(bfspPath)).length).toEqual(0); // bfsp 的packages为0
})
test(`test 自动判断是bfsw`,async () =>{
    expect((await judgeBfspBfsw(bfswPath)).length).toBeGreaterThanOrEqual(1); // bfsw的 packages大于1
})

test('test create bfsp and bfsw',async () => {
    const spyCreateBfsp = jest.spyOn(createPkgm,'createBfsp');
    const spyCreateBfsw = jest.spyOn(createPkgm,'createBfsw');
    const workspace =  path.join(__dirname,'bfsw','pkgm')
    await createPkgm.createPkgmEntrance(['packages'],workspace)
    expect(spyCreateBfsp).toHaveBeenCalledTimes(1);
    expect(spyCreateBfsw).toHaveBeenCalledTimes(1);
})

test('test 模拟子线程调用创建#bfsp.ts',async () => {
    const spyCreateBfsp = jest.spyOn(createPkgm,'createBfsp');
    const workspace =  path.join(__dirname,'bfsp','pkgm')
    await createPkgm.createPkgmEntrance([],workspace)
    await expect(spyCreateBfsp).toHaveBeenCalledTimes(1);
})
test('test 模拟子线程调用创建#bfsw.ts',async () => {
  const spyCreateBfsw = jest.spyOn(createPkgm,'createBfsw');
  const workspace =  path.join(__dirname,'bfsw','pkgm')
  await createPkgm.createPkgmEntrance(['packages'],workspace)
  await expect(spyCreateBfsw).toHaveBeenCalledTimes(1);
})


afterAll(() =>{
    removePromise(path.join(__dirname,'bfsp','pkgm'));
    removePromise(path.join(__dirname,'bfsw','pkgm'));
})

/**
 * 删除文件夹
 * @param dir
 * @returns
 */
 function removePromise (dir:string) {
    return new Promise(function (resolve, reject) {
      //先读文件夹
      fs.stat(dir,function (err, stat) {
        if(stat.isDirectory()){
          fs.readdir(dir,function (err, files) {
            const dirFiles = files.map(file=>path.join(dir,file)); // a/b  a/m
            const promiseFiles = dirFiles.map(file=>removePromise(file)); //这时候变成了promise
            Promise.all(promiseFiles).then(function () {
              fs.rmdir(dir,resolve);
            })
          })
        }else {
          fs.unlink(dir,resolve)
        }
      })
    })
  }
  
  