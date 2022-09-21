export const doPub = async (cwd: string) => {
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
  return status.success;
};

import * as path from "https://deno.land/std@0.156.0/path/mod.ts";

export const doPubFromJson = async (
  inputConfigFile: string,
  outputConfigFile = /^http(s{0,1})\:\/\//.test(inputConfigFile)
    ? undefined
    : inputConfigFile
) => {
  const npmConfigs = (
    await import(inputConfigFile, { assert: { type: "json" } })
  ).default;
  const cwdRoot = path.toFileUrl(Deno.cwd()).href + "/";

  for (const config of npmConfigs) {
    if (await doPub(config.buildToRootDir)) {
      /// 更新配置文件
      config.version = (
        await import(
          new URL(config.buildToRootDir + "/package.json", cwdRoot).href,
          {
            assert: { type: "json" },
          }
        )
      ).default.version;
    }
  }
  /// 写入配置文件
  if (outputConfigFile) {
    Deno.writeFileSync(
      new URL(outputConfigFile, import.meta.url),
      new TextEncoder().encode(JSON.stringify(npmConfigs, null, 2)),
      {}
    );
  }
};

if (import.meta.main) {
  await doPubFromJson(import.meta.resolve("./npm.json"));
}
