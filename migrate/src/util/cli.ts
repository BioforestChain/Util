import prompts from "prompts";
import chalk from "chalk";

/**
 * 请求用户是否要做出更改
 * @param {string} tips
 * @returns
 */
export const getUserCmdConfirm = (tips: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message: chalk.inverse.black(tips),
      initial: true,
    });
    resolve(response.value);
  });
};


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