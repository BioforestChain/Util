export const isNodejs = Boolean(
  typeof process !== "undefined" && process && process.versions && process.versions.node,
);

export const isWindows =
  typeof process !== "undefined" &&
  (process.platform === "win32" ||
    /^(msys|cygwin)$/.test(process.env && (process.env as any).OSTYPE));
