---
title: "Nano 速查"
description: "GNU nano 是打开后即可输入的终端编辑器，底部显示当前可用快捷键。界面中的 `^X` 表示 `Ctrl+X`，`M-X` 表示 Meta，通常是 `Alt+X`；终端不传递 Alt 时可先按 `Esc`，再按对应键。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/nano-memo/nano-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

GNU nano 是打开后即可输入的终端编辑器，底部显示当前可用快捷键。界面中的 `^X` 表示 `Ctrl+X`，`M-X` 表示 Meta，通常是 `Alt+X`；终端不传递 Alt 时可先按 `Esc`，再按对应键。

## 打开与定位

```bash
nano config.txt
nano +42,8 config.txt    # 从第 42 行第 8 列开始
nano -l config.txt      # 显示行号
nano -ET4 config.txt    # 输入 Tab 时转换为空格，宽度 4
nano -B config.txt      # 保存时保留备份
nano -v config.txt      # 查看模式
```

## 保存和编辑

| 按键 | 作用 |
| --- | --- |
| `Ctrl+O` | 写入文件，确认文件名后按 Enter |
| `Ctrl+X` | 退出；未保存时会询问 |
| `Ctrl+R` | 插入另一个文件内容 |
| `Ctrl+K` | 剪切当前行或已选择内容 |
| `Alt+6` | 复制当前行或选择内容 |
| `Ctrl+U` | 粘贴剪切缓冲区 |
| `Alt+A` | 开始 / 结束标记选择 |
| `Alt+U` / `Alt+E` | 撤销 / 重做 |
| `Ctrl+G` | 查看帮助 |

## 查找与移动

| 按键 | 作用 |
| --- | --- |
| `Ctrl+W` | 查找文本 |
| `Alt+W` | 继续向前查找 |
| `Alt+R` | 查找并替换 |
| `Alt+G` | 跳到行、列 |
| `Ctrl+A` / `Ctrl+E` | 行首 / 行尾 |
| `Ctrl+Y` / `Ctrl+V` | 上一页 / 下一页 |
| `Alt+\` / `Alt+/` | 文件开头 / 结尾 |
| `Ctrl+C` | 显示光标位置 |

提示区内同一个按键可能承担不同功能，例如查找提示中 `Alt+R` 切换正则模式。以当前底部提示和 `Ctrl+G` 帮助为准。

## 常用配置

在 `~/.nanorc` 中按需要设置：

```text
set linenumbers
set autoindent
set tabsize 4
set tabstospaces
set softwrap
```

`softwrap` 只改变屏幕显示，不会自动给文件插入换行。语法高亮文件的安装目录随系统变化，不要直接覆盖已有配置。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/nano-memo/nano-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/27-Nano速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
