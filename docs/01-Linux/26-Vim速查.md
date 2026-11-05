---
title: "Vim 速查"
description: "查询 Vim 的模式、移动、编辑、搜索、窗口和宏。以下按默认按键说明；先按 `Esc` 回到普通模式，再输入命令。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/vim-memo/vim-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

查询 Vim 的模式、移动、编辑、搜索、窗口和宏。以下按默认按键说明；先按 `Esc` 回到普通模式，再输入命令。

## 模式与退出

| 按键 | 作用 |
| --- | --- |
| `i` / `a` | 在光标前 / 后插入 |
| `I` / `A` | 在行首非空白处 / 行尾插入 |
| `o` / `O` | 在下方 / 上方新建一行并插入 |
| `v` / `V` / `Ctrl+V` | 字符 / 行 / 块选择 |
| `:` | 输入 Ex 命令 |
| `:w` | 保存 |
| `:q` | 退出；有未保存修改时拒绝 |
| `:wq` | 保存并退出 |
| `:q!` | 放弃当前缓冲区的修改并退出 |

## 移动与定位

| 按键 | 作用 |
| --- | --- |
| `h j k l` | 左、下、上、右 |
| `w` / `b` / `e` | 后一个词首 / 前一个词首 / 词尾 |
| `0` / `^` / `$` | 行首 / 首个非空白字符 / 行尾 |
| `gg` / `G` / `42G` | 首行 / 末行 / 第 42 行 |
| `Ctrl+D` / `Ctrl+U` | 向下 / 向上半屏 |
| `%` | 匹配的括号 |
| `f,` / `t,` | 到本行下一个逗号 / 逗号之前 |
| `Ctrl+O` / `Ctrl+I` | 在跳转记录中后退 / 前进 |

## 操作符与文本对象

`操作符 + 范围` 比反复按键更方便：`d` 删除，`c` 删除并进入插入模式，`y` 复制。

| 按键 | 作用 |
| --- | --- |
| `dd` / `yy` | 删除 / 复制整行 |
| `3dd` | 删除 3 行 |
| `dw` / `cw` | 删除 / 修改到下一词起点的范围 |
| `diw` / `ciw` | 删除 / 修改当前单词 |
| `ci"` | 修改双引号内部内容 |
| `da(` | 删除括号及其中内容 |
| `p` / `P` | 在后面 / 前面粘贴 |
| `u` / `Ctrl+R` | 撤销 / 重做 |
| `.` | 重复上一次改动 |
| `>>` / `<<` | 增加 / 减少缩进 |
| `gg=G` | 按当前缩进规则重排整个缓冲区 |

## 搜索与替换

```vim
/pattern
?pattern
:%s/old/new/g
:%s/old/new/gc
:10,30s/old/new/g
:noh
```

`n` / `N` 按当前搜索方向继续 / 反向查找；替换中的 `c` 要求逐次确认。Vim 正则的模式与 JavaScript 不同，例如 `\v` 可启用 very magic，不能照搬所有浏览器正则。

## 缓冲区与分屏

```vim
:e another.txt
:ls
:bnext
:bprevious
:split another.txt
:vsplit another.txt
:tabnew another.txt
```

`Ctrl+W` 后接 `h/j/k/l` 在分屏间移动，接 `w` 轮换窗口，接 `q` 关闭窗口。缓冲区是文件内容，窗口是显示区域，标签页可以包含多个窗口。

## 宏、寄存器与设置

`qa` 开始录制到寄存器 a，`q` 停止，`@a` 播放，`10@a` 重复 10 次。`"ayy` 把整行复制到 a，`"ap` 粘贴；`"+y` 系统剪贴板操作需要 Vim 编译支持。

```vim
:set number
:set relativenumber
:set expandtab shiftwidth=4 tabstop=4
:set ignorecase smartcase
:set list
:help motion
:help text-objects
```

持久配置通常写入 `~/.vimrc`。不熟悉的组合先在临时文件中练习，`vimtutor` 提供可跟做的基础教程。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/vim-memo/vim-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/26-Vim速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
