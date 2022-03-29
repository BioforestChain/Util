// @ts-check
const execa = require("execa");
const fs = require("fs");
const path = require("path");
async function doTslint() {
  const projects = fs.readdirSync(path.join(__dirname, "../packages"));
  let i = 0;
  for (const name of projects) {
    i++;
    console.log(i, name, ((i / projects.length) * 100).toFixed(2) + "%");
    try {
      await execa("tslint --project tsconfig.tslint.json > tslint.report.log", {
        cwd: path.join(__dirname, "../packages", name),
      });
    } catch (err) {
      console.error(
        `project ${name} has tslint error: ${path.relative(
          path.join(__dirname, ".."),
          path.join(__dirname, "../packages", name, "tslint.report.log"),
        )}`,
      );
    }
  }
}

doTslint().catch(console.error);
