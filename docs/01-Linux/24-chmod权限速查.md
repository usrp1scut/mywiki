---
title: "chmod 权限速查"
description: "查询数字权限、符号权限和目录访问规则。权限计算可使用 [chmod 与 umask 工具](/tools#chmod)，特殊权限的原理见 [SUID、SGID、Sticky 与 umask](./21-文件特殊权限与umask.md)。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/chmod-memo/chmod.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

查询数字权限、符号权限和目录访问规则。权限计算可使用 [chmod 与 umask 工具](/tools#chmod)，特殊权限的原理见 [SUID、SGID、Sticky 与 umask](./21-文件特殊权限与umask.md)。

## 读懂权限字符串

```text
-rwxr-x---
│└─┬─┘└┬┘└┬┘
类型 属主 属组 其他人
```

第一个字符表示类型，`-` 为普通文件、`d` 为目录、`l` 为符号链接。随后三组分别对应 `u`、`g`、`o`，`a` 表示三者全部。

| 权限 | 数值 | 普通文件 | 目录 |
| --- | --- | --- | --- |
| `r` | 4 | 读取内容 | 列出目录项名称 |
| `w` | 2 | 修改内容 | 配合 `x` 创建、删除、重命名目录项 |
| `x` | 1 | 允许执行 | 进入目录、查找其中路径 |

删除文件通常由父目录的 `w+x` 控制，不取决于文件本身能否写；Sticky、ACL、只读挂载等也可能限制操作。

## 数字与符号写法

| 命令 | 含义 |
| --- | --- |
| `chmod 600 secret.txt` | 只有属主能读写 |
| `chmod 644 config.txt` | 属主读写，其他人只读 |
| `chmod 700 private-dir` | 目录只允许属主访问 |
| `chmod 755 script.sh` | 属主可读写执行，其他人可读执行 |
| `chmod u+x script.sh` | 只增加属主执行位 |
| `chmod go-w config.txt` | 移除属组和其他人的写权限 |
| `chmod u=rw,g=r,o= config.txt` | 明确设定三类权限 |
| `chmod --reference=template.txt config.txt` | GNU chmod：复制参考文件的权限 |

省略 `u/g/o/a` 的符号写法会受 umask 影响；需要明确范围时把它写出来。

## 递归修改

```bash
# 给目录和原本已有执行位的文件增加相应执行位
chmod -R u=rwX,g=rX,o= ./site

# 若明确要求目录 755、普通文件 644，分开处理
find ./site -type d -exec chmod 755 {} +
find ./site -type f -exec chmod 644 {} +
```

第二组命令会清除普通文件的执行位，包含脚本或程序的目录不能直接套用。避免把整棵目录统一设为 `777` 或给所有文件加执行位。

## 特殊位与默认权限

| 位 | 数字前缀 | 常见用途 |
| --- | --- | --- |
| SUID | 4 | 可执行文件运行时使用文件属主的有效 UID |
| SGID | 2 | 共享目录中的新对象继承目录属组 |
| Sticky | 1 | 共享可写目录中限制删除或重命名他人文件 |

```bash
chmod 2775 shared-dir
chmod 1777 drop-dir
umask 027
```

普通文件常以 `666`、目录以 `777` 请求创建，再按位清除 umask。`027` 对应常见新文件 `640`、新目录 `750`；程序主动请求更严格权限或存在默认 ACL 时需另看实际结果。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/chmod-memo/chmod.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/24-chmod权限速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
