import chokidar from "chokidar";
import { operatingRoom } from "./doctor";

/**
 * 监听特定目录下的所有ts文件
 * @param watchPath 
 * @param packages 
 * @returns 
 */
export const watchFactory = (watchPath: string,packages?:string[]) => {
    let watchRules:string[] = ['**/*.ts'];
    if (packages !== undefined) {
        packages.map(name => {
            watchRules.push(`${name}/**/*.ts`)
        })
    }
  return new Promise((resolve, reject) => {
    // Initialize watcher.
    const watcher = chokidar.watch(watchRules, {
      ignored: [/(^|[\/\\])\../, "**/node_modules/**", "**/dist/**", "**/test/**", "**/build/**","**/#bfsp.ts","**/#bfsw.ts"], // ignore dotfiles
      persistent: true,
      cwd:watchPath
    });
    // Something to use when events are received.
    const log = console.log.bind(console);
    // Add event listeners.
    watcher
      .on("add", (path) => operatingRoom("add",path))
      .on("change", (path) =>operatingRoom("change",path))
      .on("unlink", (path) => operatingRoom("unlink",path));

    // More possible events.
    watcher
      .on("addDir", (path) => operatingRoom("addDir",path))
      .on("unlinkDir", (path) => operatingRoom("unlinkDir",path))
      .on("error", (error) => {
        operatingRoom("error",error)
        reject(error)
      })
      .on("ready", () => {
        log("Initial scan complete. Ready for changes");
        operatingRoom("ready",'')
      });

      resolve(true)
  });
};
