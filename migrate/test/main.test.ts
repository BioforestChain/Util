
import path from 'path';
import * as migrate from "../src/migrate";
import { getUserCmdConfirm } from '../src/util/cli';

test("test 检测bfsp", async () => {
  const init = await jest.spyOn(migrate, "init");
  const bfspPath = path.join(process.cwd(),'test','bfsp')
  await migrate.beforeInit(true,'opinionFile',false,bfspPath);
  await expect(init).toHaveBeenCalledTimes(1);
});

test("test 检测bfsw", async () => {
    const init = await jest.spyOn(migrate, "init");
    const bfswPath = path.join(process.cwd(),'test','bfsw')
    await migrate.beforeInit(true,'opinionFile',false,bfswPath);
    await expect(init).toHaveBeenCalledTimes(2);
  });

test("test 自定义文件名", async () => {
    const init = await jest.spyOn(migrate, "init");
    await migrate.beforeInit(true,'myTodo');
    await expect(init).toHaveBeenCalledTimes(1);
  });

test("test 文件检测数量", async () => {
  const mainMigrateFactory = await jest.spyOn(migrate, "mainMigrateFactory");
  const askDeveloperOpinion = await jest.spyOn(migrate, "askDeveloperOpinion");
  await migrate.init(true,path.join(process.cwd(),'test'))
  await expect(mainMigrateFactory).toHaveBeenCalledTimes(9);
  await expect(askDeveloperOpinion).toHaveBeenCalledTimes(1);
});

test('test 测试用户同意请求',() => {
    return getUserCmdConfirm('测试用户交互，请按下y').then(value => expect(value).toEqual(true))
})