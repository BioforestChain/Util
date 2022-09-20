# BFChain-Util

typescript util packages

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
