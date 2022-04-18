import { Command } from "commander";
import { warpWatchFactory } from "./doctor";
import { beforeInit } from "./migrate";
const program = new Command();

program
  .command("doctor [outputFolder]")
  .description("Like ESLint")
  .action((outputFolder) => {
    warpWatchFactory(outputFolder);
  });

program
  .version("@bfchain/migrate2.0.0", "-v, --version")
  .option("-y, --yes", "Direct consent to write data") //直接将不匹配规则的文件记录下来
  .option("-f, --file <string>", "Custom write filename") // 自定义文件名称
  .option("-F, --folder <string>", "Custom write output folder name") // 自定义输出目录的文件夹名称
  .action((args) => {});

program.parse(process.argv);
const options = program.opts();

// console.log(options)

let doctor = false;
try {
  process.argv.forEach((value) => {
    if (value === "doctor" || value === "d") {
      doctor = true;
      return;
    }
  });
  doctor || rocket();
} catch {
  rocket();
}

function rocket() {
  let workspaceRoot = process.cwd();
  beforeInit( workspaceRoot, options.folder, options.file);
}
