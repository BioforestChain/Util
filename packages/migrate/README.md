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
migrate -f opinion
```

### 判定规则

1. 判断是否有@types.ts 类型文件

   有：告知用户是否要进行记录

   无：进行下一逻辑处理

2. 判断是否有/\..+\.ts$/（.node.ts|.web.ts）文件

   有：告知用户是否要进行记录

   无：进行下一逻辑处理

3. 判断文件是否有 import <spe> 这样的语法

   有：告知用户在哪个文件里面

   无：进行下一逻辑处理

4. 判断是否有 index.ts 不是入口文件直接写 function

   有：告知用户是哪个 index 文件

   无：进行下一逻辑处理

5. 判断 typings 文件夹里有没有不是\*.d.ts 类型文件
   有：告知用户是否进行记录
   无：进行下一逻辑处理
