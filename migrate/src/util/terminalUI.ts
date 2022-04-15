import blessed from "blessed";
import contrib from "blessed-contrib";

const screen = blessed.screen({
  smartCSR: true,
});
// Quit on Escape, q, or Control-C.
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
export const createTableTui = (content: string) => {
  let logger = blessed.box({
    content: content,
    parent: screen,
    tags: true,
    vi: true,
    top: "0",
    left: "0",
    width: "60%",
    height: "100%",
    border: {
      type: "line",
    },
    scrollable: true,
    input: true,
    alwaysScroll: true,
    scrollbar: {
      ch: "⬆⬇",
    },
    style: {
      fg: "green",
      bg: "black",
      border: {
        fg: "#f0f0f0",
      },
    },
  });

  logger.focus();

  screen.append(logger);

  screen.render();
};

export const createAttachTui = () => {
  const donut = grid.set(8, 8, 4, 2, contrib.donut, {
    label: "Test",
    radius: 8,
    arcWidth: 3,
    remainColor: "black",
    yPadding: 2,
    data: [{ percentAltNumber: 50, percent: 80, label: "web1", color: "green" }],
  });
};
