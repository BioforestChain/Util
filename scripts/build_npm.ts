import { copySync } from "https://deno.land/std@0.156.0/fs/mod.ts";
import {
  build,
  emptyDir,
  EntryPoint,
} from "https://deno.land/x/dnt@0.30.0/mod.ts";

const BUILD_FROM_ROOT_DIR = "./packages";
const BUILD_TO_ROOT_DIR = "./.npm";
const version = Deno.args[0] || "6.0.0";

const pkgFilter = new Map<string, { entryPointName?: string }>([]);

await emptyDir(BUILD_TO_ROOT_DIR);

const entryPoints: EntryPoint[] = [];

for await (const dirEntry of Deno.readDir(BUILD_FROM_ROOT_DIR)) {
  if (dirEntry.isDirectory === false) {
    continue;
  }

  const config = pkgFilter.get(dirEntry.name) || {};

  console.group("entry-point:", dirEntry.name, config);

  const packageBaseName = dirEntry.name
    .replace(/[_]/g, "-")
    .replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())
    .replace(/^[\-]+/, "")
    .replace(/[\-]+/g, "-");
  // const packageName = "@bfchain/" + packageBaseName;

  const buildFromDir = `${BUILD_FROM_ROOT_DIR}/${dirEntry.name}`;
  // const buildToDir = `${BUILD_TO_ROOT_DIR}/${dirEntry.name}`;

  entryPoints.push({
    name: config.entryPointName || packageBaseName,
    path: `${buildFromDir}/index.ts`,
  });

  console.groupEnd();
}

const orderMap = new Map([["util", 100]]);
{
  const getOrder = (ep: EntryPoint) => orderMap.get(ep.name) || 1;
  entryPoints.sort((a, b) => getOrder(b) - getOrder(a));
}

await build({
  importMap: "./import_map.json",
  entryPoints: entryPoints,
  outDir: BUILD_TO_ROOT_DIR,
  /**
   * @TODO should ignore errors:
   * 1. TS2691
   */
  typeCheck: true,
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  compilerOptions: {
    target: "ES2020",
    importHelpers: true,
  },
  packageManager: "pnpm",
  package: {
    // package.json properties
    name: "@bfchain/util",
    version: version,
    description: `bfchain util -- copyright bnqkl`,
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
  const fromFilename = `${BUILD_FROM_ROOT_DIR}/${base}`;
  const toFilename = `${BUILD_TO_ROOT_DIR}/${base}`;
  try {
    copySync(fromFilename, toFilename, { overwrite: true });
  } catch (err) {
    if (err instanceof Deno.errors.NotFound === false) {
      throw err;
    }
  }
}
