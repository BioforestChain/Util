
import path from 'path';
import * as migrate from "../src/migrate";
import { getUserCmdConfirm } from '../src/util/cli';

test("test 创建bfsp", async () => {
  const init = await jest.spyOn(migrate, "init");
  const bfspPath = path.join(__dirname,'bfsp')
  await migrate.beforeInit(true,false,bfspPath);
  await expect(init).toHaveBeenCalledTimes(1);
});

test("test 创建bfsw", async () => {
    const init = await jest.spyOn(migrate, "init");
    const bfswPath = path.join(__dirname,'bfsw')
    await migrate.beforeInit(true,false,bfswPath);
    await expect(init).toHaveBeenCalledTimes(2);
  });

test("test 自定义文件名", async () => {
    const init = await jest.spyOn(migrate, "init");
    const bfspPath = path.join(__dirname,'bfsp')
    await migrate.beforeInit(true,false,bfspPath,'pkgm','myTodo');
    await expect(init).toHaveBeenCalledTimes(1);
  });

test("test 文件检测数量", async () => {
  const mainMigrateFactory = await jest.spyOn(migrate, "mainMigrateFactory");
  const askDeveloperOpinion = await jest.spyOn(migrate, "askDeveloperOpinion");
  await migrate.init(true,path.join(__dirname,'bfsp'))
  await expect(mainMigrateFactory).toHaveBeenCalledTimes(12);
  await expect(askDeveloperOpinion).toHaveBeenCalledTimes(1);
});

test('test 测试用户同意请求',() => {
    return getUserCmdConfirm('测试用户交互，请按下y').then(value => expect(value).toEqual(true))
})