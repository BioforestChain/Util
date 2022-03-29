const path = require("node:path");
const fs = require("node:fs");
const {
  readSrcDirAllFile
} = require('./migrate/readFile');

const workspaceRoot = path.join(__dirname, "packages");

const init = async () => {
  for (const item of fs.readdirSync(workspaceRoot)) {
    const projectRoot = path.join(workspaceRoot, item);
    const files = await readSrcDirAllFile(projectRoot);
    console.log('files', files)
    await mainMigrateFactory(files);
    break;
  }

}
init();

const mainMigrateFactory = (files) => {
  
};

const typeMigrateFactory = ()=> {

}

const nodeMigrateFactory = ()=> {
  
}

