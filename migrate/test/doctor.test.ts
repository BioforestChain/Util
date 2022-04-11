import path from 'path';
import { judgeBfspBfsw } from '../src/util/judge';
import { createPkgmEntrance } from '../src/util/createPkgmEntrance';

const bfswPath = path.join(__dirname, "bfsw");
const bfspPath = path.join(__dirname,"bfsp");


test(`test 自动判断是bfsp`,async () =>{
    expect((await judgeBfspBfsw(bfspPath)).length).toEqual(0)
})
test(`test 自动判断是bfsw`,async () =>{
    expect((await judgeBfspBfsw(bfswPath)).length).toBeGreaterThanOrEqual(1)
})



