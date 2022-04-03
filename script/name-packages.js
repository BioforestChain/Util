// @ts-check
const fs = require("fs");
const path = require("path");
const console_control_strings = require("console-control-strings");
const { prettierFormat, console } = require("@bfchain/devkit");

function namePackages(moduleBaseName) {
  const packagesRoot = path.join(__dirname, "../packages");
  const packages = fs.readdirSync(packagesRoot);

  let typingsVersion = "";
  function getTypingsVersion() {
    if (!typingsVersion) {
      typingsVersion = require(path.join(packagesRoot, "typings", "package.json")).version;
    }
    return typingsVersion;
  }

  for (const packagesSortName of packages) {
    const packageJsonPath = path.join(packagesRoot, packagesSortName, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      console.line("\n>>>", packagesSortName);
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (packagesSortName === "util") {
        packageJson.name = moduleBaseName;
      } else {
        packageJson.name = `${moduleBaseName}-${packagesSortName
          .replace(/_/g, "-")
          .replace(/[A-Z]/, (c) => "-" + c.toLocaleLowerCase())}`;
      }
      if (packagesSortName !== "typings") {
        const dependencies = packageJson.dependencies || (packageJson.dependencies = {});
        dependencies["@bfchain/util-typings"] = "^" + getTypingsVersion();
      }

      fs.writeFileSync(
        packageJsonPath,
        prettierFormat(JSON.stringify(packageJson), {
          parser: "json-stringify",
        }),
      );
      //// tscofnig
      if (packageJson.name !== "@bfchain/util-typings") {
        const tsconfigJsonPath = path.join(path.dirname(packageJsonPath), "tsconfig.json");
        const tsconfigJson = JSON.parse(fs.readFileSync(tsconfigJsonPath, "utf8"));
        const references = tsconfigJson.references || (tsconfigJson.references = []);
        const referenceHashMap = references.reduce((previous, current) => {
          previous[current.path] = current;
          return previous;
        }, {});
        const TYPINGS_TSCONFIG = "../typings/tsconfig.json";
        if (!referenceHashMap[TYPINGS_TSCONFIG]) {
          referenceHashMap[TYPINGS_TSCONFIG] = { path: TYPINGS_TSCONFIG };
        }
        tsconfigJson.references = Object.values(referenceHashMap).sort((a, b) =>
          a.path.localeCompare(b.path),
        );

        fs.writeFileSync(
          tsconfigJsonPath,
          prettierFormat(JSON.stringify(tsconfigJson), {
            parser: "json-stringify",
          }),
        );
      }
      console.line(console_control_strings.previousLine());
      console.success(packagesSortName, "=>", packageJson.name);
    }
  }
}

if (module === require.main) {
  namePackages("@bfchain/util");
}
