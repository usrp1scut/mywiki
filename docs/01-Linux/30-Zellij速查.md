---
title: "Zellij 速查"
description: "Zellij 是带模式切换、窗格、标签页和布局文件的终端工作区。以下对应常见默认键位；自定义预设可能不同，以底部提示和导出的配置为准。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/zellij-memo/zellij-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

Zellij 是带模式切换、窗格、标签页和布局文件的终端工作区。以下对应常见默认键位；自定义预设可能不同，以底部提示和导出的配置为准。

## 会话

```bash
zellij --session ops
zellij list-sessions
zellij attach ops
zellij attach --create ops
zellij kill-session ops
```

`kill-session` 会终止活动会话中的进程；即使之后能恢复布局，也不意味着原进程及其内存状态能恢复。

## 模式与按键

| 进入模式 | 模式内常用按键 |
| --- | --- |
| `Ctrl+P` 窗格 | `n` 新建，`r` 向右分屏，`d` 向下分屏，`x` 关闭，`f` 全屏 |
| `Ctrl+T` 标签页 | `n` 新建，`r` 重命名，`x` 关闭，数字键切换 |
| `Ctrl+N` 调整大小 | 方向键或 `h/j/k/l` 调整 |
| `Ctrl+H` 移动窗格 | 方向键或 `h/j/k/l` 移动 |
| `Ctrl+S` 滚动 | 翻页键滚动，`s` 进入搜索 |
| `Ctrl+O` 会话 | `d` 分离，`w` 打开会话管理器 |
| `Ctrl+G` 锁定 | 将按键传给当前程序；再次按下解除 |

通常用 `Esc` 或 `Enter` 返回普通模式。按键冲突时可先锁定界面，再使用 Vim、shell 等程序的快捷键。[官方键位说明](https://zellij.dev/documentation/keybindings)提供完整定义。

## 布局文件

```kdl
layout {
    tab name="ops" {
        pane split_direction="vertical" {
            pane
            pane command="top"
        }
    }
}
```

```bash
zellij --layout ./ops.kdl
zellij setup --dump-layout default > default-layout.kdl
zellij setup --check
zellij setup --dump-config > config.example.kdl
```

先导出到示例文件，再与 `~/.config/zellij/config.kdl` 合并，避免覆盖现有设置。

## 打开命令与文件

```bash
zellij run -- top
zellij edit ./config.yaml
zellij action new-tab --name logs
```

普通分离保留运行中的会话；彻底删除会话记录、终止全部会话是不同操作，执行前先查看 `zellij --help` 和会话列表。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/zellij-memo/zellij-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/30-Zellij速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
