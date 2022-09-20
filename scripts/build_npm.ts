import { copySync } from "https://deno.land/std@0.156.0/fs/mod.ts";
import {
  build,
  emptyDir,
  EntryPoint,
  LibName,
} from "https://github.com/Gaubee/dnt/raw/feat-more-node-module-map/mod.ts";

const VERSION = Deno.args[0] || "";
if (/[\d]+\.[\d]+\.[\d]+/.test(VERSION) === false) {
  console.warn("请输入正确的 npm 待发布版本号");
  Deno.exit(0);
}
const BUILD_FROM_ROOT_DIR = "./packages";

const doBuid = async (config: {
  version?: string;
  buildFromRootDir?: string;
  buildToRootDir: string;
  importMap: string;
  name: string;
  lib?: (LibName | string)[];
}) => {
  const {
    version = VERSION,
    buildFromRootDir = BUILD_FROM_ROOT_DIR,
    buildToRootDir,
    importMap,
    name,
    lib,
  } = config;
  console.log(`--- START BUILD: ${name}^${VERSION} ---`);
  const pkgFilter = new Map<string, { entryPointName?: string }>([
    [
      "util",
      {
        entryPointName: ".",
      },
    ],
  ]);

  await emptyDir(buildToRootDir);

  const entryPoints: EntryPoint[] = [];

  for await (const dirEntry of Deno.readDir(buildFromRootDir)) {
    if (dirEntry.isDirectory === false) {
      continue;
    }

    const config = pkgFilter.get(dirEntry.name) || {};

    // console.group("entry-point:", dirEntry.name, config);

    const packageBaseName = dirEntry.name
      .replace(/[_]/g, "-")
      .replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())
      .replace(/^[\-]+/, "")
      .replace(/[\-]+/g, "-");

    const buildFromDir = `${buildFromRootDir}/${dirEntry.name}`;
    // const buildToDir = `${BUILD_TO_ROOT_DIR}/${dirEntry.name}`;

    entryPoints.push({
      name: config.entryPointName || "./" + packageBaseName,
      path: `${buildFromDir}/index.ts`,
    });

    // console.groupEnd();
  }

  const orderMap = new Map([[".", 100]]);
  {
    const getOrder = (ep: EntryPoint) => orderMap.get(ep.name) || 1;
    entryPoints.sort((a, b) => getOrder(b) - getOrder(a));
  }

  await build({
    importMap: importMap,
    entryPoints: entryPoints,
    outDir: buildToRootDir,
    /**
     * @TODO should ignore errors:
     * 1. TS2691
     */
    typeCheck: true,
    shims: {
      // see JS docs for overview and more options
      deno: "dev",
    },
    compilerOptions: {
      target: "ES2020",
      importHelpers: true,
      isolatedModules: false,
      lib: lib as LibName[],
    },
    packageManager: "npm",
    package: {
      // package.json properties
      name: name,
      version: version,
      description: `bnqkl util`,
      license: "MIT",
      repository: {
        type: "git",
        url: "git+https://github.com/BioforestChain/Util.git",
      },
      bugs: {
        url: "https://github.com/BioforestChain/Util/issues",
      },
    },
  });

  // post build steps
  for (const base of ["README.md", "LICENSE"]) {
    const fromFilename = `${buildFromRootDir}/${base}`;
    const toFilename = `${buildToRootDir}/${base}`;
    try {
      copySync(fromFilename, toFilename, { overwrite: true });
    } catch (err) {
      if (err instanceof Deno.errors.NotFound === false) {
        throw err;
      }
    }
  }
};

import npmConfigs from "./npm.json" assert { type: "json" };

for (const config of npmConfigs) {
  await doBuid(config);
}
