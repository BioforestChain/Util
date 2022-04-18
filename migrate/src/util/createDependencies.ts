import { fsExistsSync } from "./fileFactory";
import fs from 'fs';
import path from "path";

// function createConfig(workspaceRoot:string) {
//     const configDir = path.join(workspaceRoot,'config')
//     if (!fsExistsSync(workspaceRoot)) {
//         fs.mkdirSync(configDir);
//       }
// }


export const createBfspContext = (name: string) => {
    const bfsp = `
  import { defineConfig } from "@bfchain/pkgm-bfsp";
  export default defineConfig((info) => {
    const config: Bfsp.UserConfig = {
      name: "${name}",
      exports: {
        ".": "./index.ts",
      },
      packageJson: {
        license: "MIT",
        author: "BFChainer",
      },
    };
    return config;
  });
  `;
    return bfsp;
  }
  export const  createBfswContext = () => {
    const bfsw = `
  import { defineWorkspace } from "@bfchain/pkgm-bfsw";
  export default defineWorkspace(() => {
    const config: Bfsw.Workspace = {
      projects: [],
    };
    return config;
  });
  `;
    return bfsw;
  }

