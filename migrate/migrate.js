const path = require("node:path");
const {
  getWorkspaceContext,
  createWriteStream,
  createReadStream
} = require('./fileFactory');
const {
  getUserCmdInput,
  getUserCmdConfirm
} = require("./cli");
const os = require('os');

let workspaceRoot = path.join(__dirname, "../packages");
const opinionFile = path.join(__dirname, 'opinionFile.md');
const emptyFiles = []; // src下没有文件的文件（备用）
const typeFiles = []; // type类型匹配到的文件
const nodeFiles = []; // .node.ts 类型匹配到的文件
const declareFiles = []; // @types.ts 这种文件，只用来declare，不可以出现import <spe> 这样的语法

const beforeInit = async () => {
  const result = await getUserCmdConfirm(`此工具将会帮助您的代码风格向pkgm靠拢 ${os.EOL} 您现在是否在您的工作目录下？`);
  if (result) {
    return init();
  }
  const workspaces = await getUserCmdInput('请输入您工作区的位置(相对路径)：');
  workspaceRoot = path.join(__dirname, workspaces);
  init();
}
beforeInit();

const init = async () => {
  const {
    fileDirs,
    filesArrs
  } = await getWorkspaceContext(workspaceRoot)
  fileDirs.forEach(async (dir, index) => {
    await mainMigrateFactory(filesArrs[index], dir);
  });
  await askDeveloperOpinion();
  console.log('风格标记结束');
}

/**
 * 给用户选择，是否把不符合pkgm的记录下来
 */
const askDeveloperOpinion = async () => {
  if (typeFiles.length !== 0) {
    console.log(typeFiles);
    const result = await getUserCmdConfirm(`以上文件不符合pkgm的*.t.ts 风格是否要把以上文件记录下来?`);
    if (result) {
      await typeMigrateFactory(typeFiles);
    }
  }
  if (nodeFiles.length !== 0) {
    console.log(nodeFiles)
    const result = await getUserCmdConfirm(`以上文件不符合pkgm的*#node.ts风格是否要把以上文件记录下来?`);
    if (result) {
      await nodeMigrateFactory(nodeFiles);
    }
  }
  if (declareFiles.length !== 0) {
    console.log(declareFiles);
    const result = await getUserCmdConfirm(`pkgm规定@types.ts 这种文件，只用来declare，不可以出现import <spe> 是否要把以上文件记录下来?`);
    if (result) {
      await declareMigrateFactory(declareFiles);
    }
  }
}

/**
 * 收集匹配规则的文件
 * @param {*} files 
 * @param {*} srcDir 
 * @returns 
 */
const mainMigrateFactory = async (files, srcDir) => {
  if (files.length === 0) return emptyFiles.push(srcDir);
  files.map(async (file, index) => {
    const filesDir = path.join(srcDir, file);
    if (/@type[s]?\.ts[x]?$/.test(file)) {
      typeFiles.push(filesDir);
      await declareFilesRule(filesDir)
    }

    if (/\.[^d]+\.ts[x]?$/.test(file)) {
      nodeFiles.push(filesDir);
    }
  })
};

const typeMigrateFactory = async (typeFiles) => {
  console.log('typeMigrateFactory:', typeFiles);
  createWriteStream(opinionFile, typeFiles, '以下文件不符合pkgm的*.t.ts 风格');
}

const nodeMigrateFactory = (nodeFiles) => {
  createWriteStream(opinionFile, nodeFiles, '以下文件不符合pkgm的*#node.ts风格', {
    'flags': 'a'
  });
}

const declareMigrateFactory = (declareFiles) => {
  createWriteStream(opinionFile, declareFiles, '@types.ts 这种文件，只用来declare，不可以出现import <spe>', {
    'flags': 'a'
  });
}

/**
 * 处理@types.ts里有import的
 * @param {*} filesDir 
 * @returns 
 */
const declareFilesRule = (filesDir) => {
  return new Promise(async (resolve) => {
    const dataChunk = await createReadStream(filesDir);
    if (/import\(.+\)/g.test(dataChunk)) {
      declareFiles.push(filesDir);
    }
    resolve()
  })
}