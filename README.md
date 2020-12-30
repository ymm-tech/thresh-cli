# 使用 thresh-cli 命令快速创建项目



在目标目录中执行 thresh-cli create yourAppName 命令即可创建一个新的，如：`thresh-cli create TreshTest1`，项目创建的同时会自动安装相关依赖。



> **TIP**

> 自动安装依赖通过 `yarn` 执行，请先全局安装 `yarn`

> `thresh-cli create` 命令创建的项目，其项目名会同时作为 package.json 中的 name 字段，并且该字段会作为项目在宿主工程中的模块名被使用。因此如项目名不是模块名，需要自行修改 package.json 中的 name 字段。





```

ManbangMacBook-Pro:thresh_test_demo Manbang$ thresh-cli create ThreshTest1

使用ThreshTest1作为项目/模块名称? (y/N) y

创建项目成功

```