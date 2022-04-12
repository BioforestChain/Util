import path from 'path';
import { judgeBfspBfsw } from '../src/util/judge';
import * as createPkgm from '../src/util/createPkgmEntrance';
import { deleteFile, deleteOneFile } from '../src/util/fileFactory';

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
    await createPkgm.createBfsw(['test'])
    expect(spyCreateBfsp).toHaveBeenCalledTimes(1);
    expect(spyCreateBfsw).toHaveBeenCalledTimes(1);
})

test('test 模拟子线程调用',async () => {
    const spyCreateBfsp = jest.spyOn(createPkgm,'createBfsp');
    await createPkgm.init(true)
    await expect(spyCreateBfsp).toHaveBeenCalledTimes(1);
})

afterAll(() =>{
    deleteFile(path.join(process.cwd(),'test'),'#bfsp.ts');
    deleteFile(path.join(process.cwd()),'#bfsw.ts')
    deleteFile(path.join(process.cwd()),'#bfsp.ts');
    deleteOneFile(path.join(process.cwd(), "opinionFile.md"));
    deleteOneFile(path.join(process.cwd(), "myTodo.md"));
})

