import chalk from "chalk";

/**
 * 返回对应文字的颜色
 * @param color 
 * @returns function getColor()
 */
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