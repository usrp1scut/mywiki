---
title: Linux 文件的三种时间与两种路径
sidebar_position: 16
description: atime、mtime、ctime 的触发条件与查看方式，以及绝对路径和相对路径的区别与适用场景。
---

# Linux 文件的三种时间与两种路径

## 文件的三种时间

| 时间 | 全称 | 触发变动的情况 |
|---|---|---|
| atime | Access Time（访问时间） | 文件被读取/查看内容时更新（如 `cat`）。很多系统默认使用 `relatime` 优化，并非每次读都更新 |
| mtime | Modify Time（修改时间） | 文件**内容**被修改时更新（写入、追加、`echo >`）。`ls -l` 默认显示的就是 mtime |
| ctime | Change Time（状态改变时间） | 文件**元数据（属性）**改变时更新，例如权限 `chmod`、属主 `chown`、链接数变化；内容修改也会连带更新 ctime，因为 mtime 本身就是元数据的一部分 |

### 简单记忆

```text
读文件                  -> atime 变
改内容                  -> mtime、ctime 都变
改权限/属主/文件名（不改内容）-> 只有 ctime 变
```

### 查看方式

```bash
stat 文件名     # 同时显示三种时间
ls -l           # 默认显示 mtime
ls -lu          # 显示 atime
ls -lc          # 显示 ctime
```

## 绝对路径与相对路径

### 绝对路径 Absolute Path

从根目录 `/` 开始描述的完整路径，无论当前在哪个目录都能准确定位。

```text
/home/user/docs/file.txt
```

### 相对路径 Relative Path

从当前所在目录开始的路径，依赖当前工作目录。

```text
docs/file.txt   # 当前目录下的 docs 文件夹
../file.txt     # 上一级目录
./file.txt      # 当前目录（./ 可省略）
```

### 对比

| 对比项 | 绝对路径 | 相对路径 |
|---|---|---|
| 起点 | 根目录 `/` | 当前工作目录 |
| 唯一性 | 唯一确定，不受位置影响 | 随当前目录变化，结果可能不同 |
| 长度 | 通常较长 | 通常较短，输入方便 |
| 适用场景 | 脚本、配置文件、跨目录引用 | 临时操作、同目录或邻近目录的文件 |

### 举例

假设当前在 `/home/user`，要访问 `/home/user/docs/file.txt`：

```bash
cat /home/user/docs/file.txt   # 绝对路径
cat docs/file.txt              # 相对路径
```

**写脚本或自动化任务时建议使用绝对路径**，避免因当前目录变化导致找不到文件；日常手动操作用相对路径更方便。
