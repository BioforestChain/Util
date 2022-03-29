const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "../packages");
const cachePath = path.resolve(__dirname, "../.cache");
const { matchRemover } = require("@bfchain/devkit");

matchRemover(
  rootPath,
  (file, fullpath, deep) =>
    deep === 2 && fs.statSync(fullpath).isDirectory() && file.includes("build"),
  2,
);
matchRemover(cachePath, _ => true);
