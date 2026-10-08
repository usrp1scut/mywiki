---
title: Linux 命令的查找与执行优先级
sidebar_position: 15
description: 环境变量与 PATH 的作用，以及 Bash 的别名解析、函数、内建命令和外部命令查找顺序。
---

# Linux 命令的查找与执行优先级

## 环境变量

环境变量是进程环境中保存的一组键值对（`key=value`），用于存放系统或程序运行时需要的配置信息，例如用户主目录、语言设置、可执行文件搜索路径。**Shell 导出的变量会被随后启动的子进程继承，子进程的修改不会反向更新父进程。**

```bash
echo "$PATH"        # 查看单个变量
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

以普通 Bash 模式为例：命令名不含 `/`，且未命中函数或已启用的内建命令时，Shell 才查找外部程序；先检查命令路径缓存，未缓存时再**按顺序**搜索 PATH 中的目录。

```bash
$ which ls
/bin/ls
```

这个输出说明 `which` 在 PATH 中找到了 `/bin/ls`；当前 Shell 仍可能先命中同名别名或函数，需用 `type -a ls` 确认。

这也是为什么自己安装的程序如果不在 PATH 目录下，就需要指定路径（如相对路径 `./myprogram` 或绝对路径 `/opt/bin/myprogram`）运行，或者手动把它的目录加入 PATH。

## 命令执行优先级（从高到低）

别名与 `if`、`for` 等保留字由解析阶段处理，不属于下面的可执行命令查找顺序。以下针对普通 Bash 模式中不含 `/` 的命令名：

| 优先级 | 类型 | 说明 | 示例 |
|---:|---|---|---|
| 1 | 函数 Function | Shell 中自定义的函数 | `myfunc() { echo hello; }` |
| 2 | 内建命令 Builtin | 已启用的 Shell 内建命令 | `cd`、`echo`、`export`、`pwd`、`read` |
| 3 | 外部命令 External | 从缓存或 PATH 定位的外部可执行文件 | `/bin/ls`、`/usr/bin/grep` |

### 查看命令类型

```bash
type ls        # 判断属于哪种命令
type -a echo   # 查看该命令名在各优先级下是否都存在
```

### 为什么要定优先级

当命令名重复时（例如自定义了一个叫 `ls` 的别名），Shell 需要按固定顺序判断该执行哪一个，避免歧义。这也是为什么内建命令（如 `cd`）不会被同名的外部程序覆盖执行逻辑——内建命令的优先级高于外部命令。

校核依据：[Bash 命令查找与执行](https://www.gnu.org/software/bash/manual/html_node/Command-Search-and-Execution.html)、[别名](https://www.gnu.org/software/bash/manual/html_node/Aliases.html)。
