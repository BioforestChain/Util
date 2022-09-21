import { copySync } from "https://deno.land/std@0.156.0/fs/mod.ts";
import {
  build,
  emptyDir,
  EntryPoint,
  LibName,
} from "https://github.com/Gaubee/dnt/raw/feat-more-node-module-map/mod.ts";

export const doBuid = async (config: {
  name: string;
  version: string;
  buildFromRootDir: string;
  buildToRootDir: string;
  importMap?: string;
  lib?: (LibName | string)[];
}) => {
  const { version, buildFromRootDir, buildToRootDir, importMap, name, lib } =
    config;
  console.log(`--- START BUILD: ${name} ${version} ---`);
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

import * as semver from "https://deno.land/std@0.156.0/semver/mod.ts";

export const getVersionGenerator = (version_input?: string) => {
  let getVersion = (version: string) => {
    return version;
  };
  if (version_input) {
    if (version_input.startsWith("+")) {
      const [release, identifier] = version_input
        .slice(1)
        .split(/\:/)
        .map((v, index) => {
          if (index === 0) {
            switch (v) {
              case "1":
                return "patch";
              case "1.0":
                return "minor";
              case "1.0.0":
                return "major";
              case "pre":
                return "prerelease";
            }
          }
          return v;
        });
      if (
        !(
          release === "major" ||
          release === "minor" ||
          release === "patch" ||
          (release === "prerelease" && typeof identifier === "string")
        )
      ) {
        console.error(
          "请输入正确的 ReleaseType: major, minor, patch, prerelease:identifier"
        );
        Deno.exit(0);
      }
      // major, minor, patch, or prerelease
      getVersion = (version) =>
        semver.inc(version, release, undefined, identifier) || version;
    } else {
      const semver_version = semver.minVersion(version_input);
      if (semver_version === null) {
        console.error("请输入正确的待发布版本号");
        Deno.exit(0);
      }

      getVersion = () => semver_version.toString();
    }
  }
  return getVersion;
};

export const doBuildFromJson = async (file: string) => {
  const getVersion = getVersionGenerator(Deno.args[0]);
  const npmConfigs = (await import(file, { assert: { type: "json" } })).default;

  for (const config of npmConfigs) {
    await doBuid({
      ...config,
      version: getVersion(config.version),
    });
  }
};

if (import.meta.main) {
  await doBuildFromJson(import.meta.resolve("./npm.json"));
}
