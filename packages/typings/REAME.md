# dev

## `watch tsconfig.typings.json` then `tsconfig.isolated.json`

### `watch tsconfig.typings.json`

> 这里只编译出纯粹的类型定义文件`.type.ts`，目的是为了之后快速编译做准备（包括 dev:isolated 与 build:isolated）
> 这里输出的文件，会被汇总到一个 `dist.d.ts` 文件中。要注意的是，虽然该项目包含了所有的文件，但是不是以项目默认的`index.ts`文件作为入口，而是以`dist.d.ts`文件作为入口。该入口只包含了`.type.d.ts`文件，这类文件的特性是使用了全局`declare`风格

```json
"isolatedModules": false,
"noEmit": true,
"emitDeclarationOnly": false,

"files": ["*"]
```

### `tsconfig.isolated.json`

> 我们会默认将`tsconfig.typings.json`编译的结果通过`typeRoots`与`types`配置，将全局的`declare`导入到当前的环境中。而后，在该项目里，才会开始有严格的`"isolatedModules": true`的代码编译，此时是严格要求开发者不可以书写全局`declare`风格的代码， 只能遵循 ecmascript 最基本的代码风格，import 语句就是给模块用的。
> 这里的编译，会直接要求开发者不可以写`import './*.type'`的代码，因为 files 不包含这些文件
> 这里的编译，虽然会因为缓存等问题（因为我们用了 typeRoots 与 types 来导入 tsconfig.typings.json 的编译结果，属于外部项目，它不是实时能进入到代码中的），导致很多误判，但最核心的错误可以直接地指出来，包括：`TS1208(isolatedModules判定)`、`TS6307(导入了type.ts文件)`。这些错误不会因为缓存而误判，因为他们是直接由 files 字段指定的文件，是实时在编译的

```json
"isolatedModules": true,
"noEmit": false,
"emitDeclarationOnly": true,
"files": ["*", "-.type.ts"]
"typeRoots": ["./$TYPINGS-ROOT"],
"types": ["typings"]
```

# build

## `tsconfig.typings.json` then mix

1. `tsconfig.typings.json` 已经包含了全部的程序主题的 ts 代码文件
2. `dist.d.ts`仍然会被处理
3. 开发者自己定义的 exports 出口文件中，都会被带上`/// <reference path="./dist.d.ts"/>`代码，从而实现跟配置`"typeRoots": ["./$TYPINGS-ROOT"], "types": ["typings"]`一样的效果
