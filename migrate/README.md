## 将代码风格向 pkgm 靠拢

### 安装方法

```bash
yarn add @bfchain/migrate -g
```

#### 或者

```bash
git clone

git install

npm link
```

#### 不想安装

```
npx migrate
```

### 支持的命令

该命令将监听整个项目，动态协助您迁移到pkgm风格，类似ESLint。

该命令通过判断lerna.json来确定是bfsp还是bfsw项目。

```
migrate doctor 
```

同意将不匹配规则的文件记录下来，如果不加这个命令，会进行询问

```
migrate -y
```

当您需要把不匹配规则的文件记录下来的时候，这个命令能让您自定义创建文件名（格式为markdown）

```
migrate -f <fileName>
```

自动识别并创建#bfsp.ts和##bfsw.ts文件
```
migrate -p
```

同意将不匹配规则的文件记录下来，并且自动识别并创建#bfsp.ts和##bfsw.ts文件
```
migtate -yy 
```

### 判定规则

##### 规则按级别划分为 禁止/警告/建议

1. 警告：判断是否有@types.ts 类型文件 : 相对应pkgm的代码风格，就是 *.type.ts 属于类型文件

2. 警告：判断是否有/\..+\.ts$/（.node.ts|.web.ts）文件: .node.ts 或者 .web.ts类型应该定义为*#node.ts 与 *#web.ts

3. 禁止：判断@type文件是否有 import <spe> 这样的语法: @types.ts 这种文件，只用来declare，不可以出现import <spe>

4. 建议：判断是否有 index.ts 不是入口文件直接写 function

5. 禁止: import mod from '#mod' 这种以#开头导入的文件为pkgm语法，未迁移的项目不允许出现

6. 禁止: #开头是pkgm私有导入的写法，所以不允许在旧项目出现文件名带#

7. 警告：*.test.ts在bfsp中属于测试文件




