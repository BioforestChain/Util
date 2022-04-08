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
      ignored: [/(^|[\/\\])\../, "**/node_modules/**", "**/dist/**", "**/test/**", "**/build/**"], // ignore dotfiles
      persistent: true,
      cwd:watchPath
    });
    // Something to use when events are received.
    const log = console.log.bind(console);
    // Add event listeners.
    watcher
      .on("add", (path) => operatingRoom(path))
      .on("change", (path) =>operatingRoom(path))
      .on("unlink", (path) => operatingRoom(path));

    // More possible events.
    watcher
      .on("addDir", (path) => operatingRoom(path))
      .on("unlinkDir", (path) => operatingRoom(path))
      .on("error", (error) => reject(error))
      .on("ready", (path: string) => {
        log("Initial scan complete. Ready for changes");
        operatingRoom(path,true)
      });

      resolve(true)
  });
};
