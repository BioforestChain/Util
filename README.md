# Bnqkl-Util

typescript util packages

## 如何使用

### 如何在 nodejs 中使用

编译会分发出两个包： `@bnqkl/util-node` 与 `@bnqkl/util-web` 。不会再有其它子包（也就是说所有的自包现在已经全部聚合成一个包）。

> 如果要兼容原本的用法： `npm i @bfchain/util@npm:@bnqkl/util-node` (`npm install <alias>@npm:<name>`)。或者在 pakcage.json/deps 中写： `"@bfchain/util": "npm:@bnqkl/util@^1.0.0"`

### 如何在 dnt 中使用

> [dnt](https://github.com/denoland/dnt) 是一个将 Deno 转化成 Node 的工具。本项目也使用这个工具进行开发。
> 本项目之所以使用这个方案，是因为有多平台分发的需求，而 deno 的 importMap 可以很好的解决这个问题。
> 如果您的项目也有类似的需求，需要将一套代码分发到多个包中，那么可以使用本项目的解决方案：

1.  配置 [npm.json]('./scripts/npm.json')
1.  编译 [build_npm.ts]('./scripts/build_npm.ts')
1.  发布 [pub_npm.ts]('./scripts/pub_npm.ts')

如果您也选择了这个方案，说明您的目标是编译到 nodejs 平台， 那么这里的建议是使用 `https://esm.sh/` 来获取 npm 包，比如：

```ts
import { Inject } from "https://esm.sh/@bnqkl/util-node@1.0.0";
```

然后再通过 [importMap](https://deno.land/manual@v1.25.3/linking_to_external_code/import_maps) 的配置来编译来将`https://esm.sh/@bnqkl/util-node` 修改成 `https://esm.sh/@bnqkl/util-web` 以分发到不同的包中。

### 如何在 deno 中使用

```ts
import { Inject } from "https://deno.land/x/bnqkl_util@1.0.0/mod.ts";
```

## 命名规范

1. 代码中：`$`开头的为着“无副作用函数”，主要有两类：
   1. `$`+`小写`：为无副作用函数（需要在 jsdoc 中声明`@inline`）
   1. `$`+`大写`：为 TypeScript 类型定义与推断
1. 代码中：`纯大写`+`下划线` 通常为“零成本抽象”定义，目前只有一类：`const enum`

1. 文件中：包含`!`意味着“宏”，会被编译期间动态替换掉的
   1. `import/export`的`path`中如果是`!`开头，说明该路径会在`importMap`配置中被动态替换
   1. 文件名称:`!`+`profile`的会随着编译去替换到`importMap`中的目标文件，目前`profile`只有两种：`node`/`browser`
1. 代码中：无副作用函数调用带有`!`声明的，会被编译器内联：

   ```ts
   // 无副作用函数
   const $add = (a, b, ...rest) => a + b;
   // 源代码
   const res = $add!(...args);
   // 编译结果
   let $someFun_return;
   {
     // decalre argument
     const [a, b, ..rest] = args
     // replace source code
     // if arrow function , add return keyword
     // then replace return keyword as `someFun_return = `
     $someFun_return = a + b;
   }
   // replacement function call
   const res = $someFun_return;
   ```

```

```
