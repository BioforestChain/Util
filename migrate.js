const path = require("node:path");
const fs = require("node:fs");

const workspaceRoot = path.join(__dirname, "packages");
for (const item of fs.readdirSync(workspaceRoot)) {
  const projectRoot = path.join(workspaceRoot, item);
}

const migrateProject = (projectRoot) => {
    
};
