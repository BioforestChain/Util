import prompts from "prompts";
import chalk from "chalk";


export const getUnderlineColor = (color: string) => {
  switch (color) {
    case "yellow":
      return function (text: string) {
        return chalk.underline.yellow(text);
      };
    case "red":
      return function (text: string) {
        return chalk.underline.red(text);
      };
    case "blue":
      return function (text: string) {
        return  chalk.underline.blue(text);
      };
    default:
      return function (text: string) {
        return  chalk.underline.black(text);
      };
  }
};