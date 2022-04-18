
import path from 'path';
import * as migrate from "../src/migrate";

test("test 创建bfsp", async () => {
  const init = await jest.spyOn(migrate, "init");
  const bfspPath = path.join(__dirname,'bfsp')
  await migrate.beforeInit(bfspPath);
  await expect(init).toHaveBeenCalledTimes(1);
});

test("test 创建bfsw", async () => {
    const init = await jest.spyOn(migrate, "init");
    const bfswPath = path.join(__dirname,'bfsw')
    await migrate.beforeInit(bfswPath);
    await expect(init).toHaveBeenCalledTimes(2);
  });

test("test 自定义文件名", async () => {
    const init = await jest.spyOn(migrate, "init");
    const bfspPath = path.join(__dirname,'bfsp')
    await migrate.beforeInit(bfspPath,'pkgm','myTodo');
    await expect(init).toHaveBeenCalledTimes(1);
  });

test("test 文件检测数量", async () => {
  const mainMigrateFactory = await jest.spyOn(migrate, "mainMigrateFactory");
  const askDeveloperOpinion = await jest.spyOn(migrate, "askDeveloperOpinion");
  await migrate.init(path.join(__dirname,'bfsp'))
  await expect(mainMigrateFactory).toHaveBeenCalledTimes(13);
  await expect(askDeveloperOpinion).toHaveBeenCalledTimes(2);
});
