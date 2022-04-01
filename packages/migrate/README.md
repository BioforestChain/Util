## 将代码风格向pkgm靠拢

### 使用方法

```bash
npm install @bfchain/migrate -g

migrate
```

#### 或者

```bash
git clone 

git install 

npm link

migrate
```



1. 判断是否有@types.ts 类型文件

    有：告知用户是否要进行记录

    无：进行下一逻辑处理
        

2. 判断是否有/\..+\.ts$/（.node.ts|.web.ts）文件

    有：告知用户是否要进行记录

    无：进行下一逻辑处理

3. 判断文件是否有import <spe> 这样的语法

    有：告知用户在哪个文件里面

    无：进行下一逻辑处理
