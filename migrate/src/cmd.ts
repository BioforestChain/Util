import { Command } from "commander";
import path from "path";
import { warpWatchFactory } from "./doctor";
import { beforeInit } from "./migrate";
const program = new Command();

program.command("doctor <outputFolder>")
.description("Like ESLint")
.executableDir('doctor')
.action((outputFolder) => {
  warpWatchFactory(outputFolder);
});


program
  .version("@bfchain/migrate2.0.0", "-v, --version")
  .option("-p, --bfsp", "auto create #bfsp.ts or #bfsw.ts") // 创建#bfsp.ts或者#bfsw.ts
  .option("-y, --yes", "Direct consent to write data") //直接将不匹配规则的文件记录下来
  .option("-f, --file <string>", "Custom write filename") // 自定义文件名称
  .option("-yy, --yy", "Defaults to the current directory and Direct consent to write data") //直接将不匹配规则的文件记录下来，并且创建#bfsp.ts或者#bfsw.ts
  .option("-d, --folder <string>", "Custom write output folder name"); // 自定义输出目录的文件夹名称

program.parse(process.argv);

const options = program.opts();

//  console.log(process.argv)
const rocket = () => {
  let bfsp = false;// 是否要创建#bfsp.ts或者#bfsw.ts
  let yes = false; // 是否要将不匹配规则的文件记录下来
  if (options.bfsp) {
    bfsp = true;
  }
  if (options.yes){
    yes = true;
  }

  // 如果没有同意在当前目录，并且记录文件名
  if (options.yy === undefined) {
      beforeInit(yes, options.file,bfsp,options.folder);
  } else {
    // 直接将不匹配规则的文件记录下来，并且创建#bfsp.ts或者#bfsw.ts
    beforeInit(true, options.file,true,options.folder);
  }
};

let doctor = false;
try {
  process.argv.forEach((value) => {
    if (value === "doctor") {
      doctor = true;
      return;
    }
  });
  doctor || rocket();
} catch {
  rocket();
}
