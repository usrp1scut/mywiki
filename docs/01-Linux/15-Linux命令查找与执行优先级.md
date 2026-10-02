---
title: Linux 命令的查找与执行优先级
sidebar_position: 15
description: 环境变量与 PATH 的作用，以及别名、关键字、函数、内建命令、外部命令的执行优先级。
---

# Linux 命令的查找与执行优先级

## 环境变量

环境变量是操作系统中保存的一组键值对（`key=value`），用于存放系统或程序运行时需要的配置信息，例如用户主目录、语言设置、可执行文件搜索路径。**进程创建时会继承父进程的环境变量。**

```bash
echo $PATH          # 查看单个变量
export MY_VAR=value # 设置/导出变量
env                 # 查看全部环境变量
printenv MY_VAR     # 查看某个变量
unset MY_VAR       # 删除变量
```

## PATH 的作用

`PATH` 存放一串用冒号分隔的目录路径：

```text
/usr/local/bin:/usr/bin:/bin:/sbin
```

当输入一个命令（如 `ls`）时，Shell 会**按顺序**在 PATH 列出的目录中查找同名可执行文件，找到就执行，找不到就报 `command not found`。

```bash
$ which ls
/bin/ls
```

说明 `ls` 实际是 `/bin/ls`，因为 `/bin` 在 PATH 中，所以直接输入 `ls` 就能找到。

这也是为什么自己安装的程序如果不在 PATH 目录下，就必须用完整路径（如 `./myprogram`）运行，或者手动把它的目录加入 PATH。

## 命令执行优先级（从高到低）

| 优先级 | 类型 | 说明 | 示例 |
|---:|---|---|---|
| 1 | 别名 alias | 用户自定义的命令简写 | `alias ll='ls -l'` |
| 2 | 关键字 / 保留字 Keyword | Shell 语法中的保留词 | `if`、`for`、`while`、`do`、`done` |
| 3 | 函数 Function | Shell 中自定义的函数 | `myfunc() { echo hello; }` |
| 4 | 内建命令 Builtin | Shell 自带，无需外部程序 | `cd`、`echo`、`export`、`pwd`、`read` |
| 5 | 外部命令 External | 磁盘上通过 PATH 查找到的可执行文件，需 fork 新进程 | `/bin/ls`、`/usr/bin/grep` |

### 查看命令类型

```bash
type ls        # 判断属于哪种命令
type -a echo   # 查看该命令名在各优先级下是否都存在
```

### 为什么要定优先级

当命令名重复时（例如自定义了一个叫 `ls` 的别名），Shell 需要按固定顺序判断该执行哪一个，避免歧义。这也是为什么内建命令（如 `cd`）不会被同名的外部程序覆盖执行逻辑——内建命令的优先级高于外部命令。
