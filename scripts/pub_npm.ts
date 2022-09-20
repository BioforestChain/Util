const doPub = async (cwd: string) => {
  const p = Deno.run({
    cwd,
    cmd: ["npm", "publish", "--access", "public"],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  const status = await p.status();
  p.close();
  console.log(status);
};

import npmConfigs from "./npm.json" assert { type: "json" };

for (const config of npmConfigs) {
  await doPub(config.buildToRootDir);
}
