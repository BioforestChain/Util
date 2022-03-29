import { isFlagInDev } from "@bfchain/util-env";

export const EVENT_DESCRIPTION_SYMBOL = Symbol("eventemitter.description");
export const eventDebugStyle = {
  head: isFlagInDev("browser")
    ? (message: string, style: string) => {
        return ["%c" + message, style];
      }
    : (message: string, style: string) => {
        return [message];
      },
  MIDNIGHTBLUE_BOLD_UNDERLINE: "color:midnightblue;text-decoration: underline;font-weight: bold;",
  DARKVIOLET_BOLD_UNDERLINE: "color:darkviolet;text-decoration: underline;font-weight: bold;",
};
