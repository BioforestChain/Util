## 将代码风格向 pkgm 靠拢

### 使用方法

```bash
yarn add @bfchain/migrate -g

migrate
```

#### 或者

```bash
git clone

git install

npm link

migrate
```

### 支持的命令

直接同意写入全部匹配文件

```
migrate -y
```

自定义写入文件的名称

```
migrate -f <fileName>
```

同意在当前文件夹下，并且进行记录
```
migtate -yy 
```

### 判定规则

1. 判断是否有@types.ts 类型文件 : 相对应pkgm的代码风格，就是 *.type.ts 文件

   有：告知用户是否要进行记录

   无：进行下一逻辑处理

2. 判断是否有/\..+\.ts$/（.node.ts|.web.ts）文件: .node.ts 或者 .web.ts类型应该定义为*#node.ts 与 *#web.ts

   有：告知用户是否要进行记录

   无：进行下一逻辑处理

3. 判断@type文件是否有 import <spe> 这样的语法: @types.ts 这种文件，只用来declare，不可以出现import <spe>

   有：告知用户在哪个文件里面

   无：进行下一逻辑处理

4. 判断是否有 index.ts 不是入口文件直接写 function

   有：告知用户是哪个 index 文件

   无：进行下一逻辑处理

