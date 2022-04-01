import { Command } from "commander";
import { agreeRecordAllData, beforeInit } from "./migrate";
const program = new Command();

program
  .version("@bfchain/migrate1.0.1", "-v, --version")
  .option("-y, --yes", "Direct consent to write data")
  .option("-f, --file <string>","Custom write filename")

program.parse(process.argv);

const options = program.opts();

if (options.yes === undefined) {
  beforeInit(false,options.file);
} 

if (options.yes === true) {
  agreeRecordAllData(options.file);
}
