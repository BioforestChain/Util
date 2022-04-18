import blessed from "blessed";
import contrib from "blessed-contrib";
import { IAlarmLevel } from "typings/file";

const screen = blessed.screen({
  fullUnicode: true,
  smartCSR: true,
});
// Quit on Escape, q, or Control-C.
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

export const attachData:IAlarmLevel = {
  red:{percent: 0, label: 'ban', color: 'red'},
  yellow:{percent: 0, label: 'warn', color: 'yellow'},
  blue:{percent: 0, label: 'suggest', color: 'blue'}
}

const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
let logger = grid.set(1, 0, 10, 5, blessed.log, {
  label: "不匹配规则输出(按j向下，按k向上)",
  parent: screen,
  tags: true,
  vi: true,
  border: {
    type: "line",
  },
  keys: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: "|",
    track: {
      bg: "yellow",
    },
  },
  style: {
    fg: "green",
    bg: "black",
    border: {
      fg: "#f0f0f0",
    },
  },
});

const donut =  grid.set(1, 5, 7, 4, contrib.donut,{
  label: "修改进度",
  radius: 8,
  arcWidth: 3,
  remainColor: "black",
  yPadding: 2,
});

export const adapterTui = (content:string, attachData:IAlarmLevel) => {
  createLoggerTui(content);
  createAttachTui(attachData);
}

function createLoggerTui (content: string) {
  logger.focus();
  logger.log(content);
  screen.append(logger);
  screen.render();
};

function createAttachTui (attachData:IAlarmLevel) {
  screen.append(donut);
  donut.setData([
    attachData.red,
    attachData.yellow,
    attachData.blue
  ]);
};
