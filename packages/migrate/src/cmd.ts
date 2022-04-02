import { Command } from "commander";
import { agreeRecordAllData, beforeInit } from "./migrate";
const program = new Command();

program
  .version("@bfchain/migrate1.0.1", "-v, --version")
  .option("-y, --yes", "Direct consent to write data") //默认记录文件名
  .option("-f, --file <string>","Custom write filename") // 自定义文件名称
  .option("-yy, --yy","Defaults to the current directory and Direct consent to write data")//默认同意在当前目录，并且记录文件名

program.parse(process.argv);

const options = program.opts();

// 如果没有同意在当前目录，并且记录文件名
if(options.yy === undefined) {
  if (options.yes === undefined) {
    beforeInit(false,options.file);
  } 
  
  if (options.yes === true) {
    agreeRecordAllData(options.file);
  }
} else {
  // 当默认同意在当前目录，并且记录文件名
  beforeInit(true,options.file,true)
}


