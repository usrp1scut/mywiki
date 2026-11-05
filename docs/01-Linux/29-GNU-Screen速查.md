---
title: "GNU Screen 速查"
description: "GNU Screen 提供可分离、可重新连接的终端会话。适合通过 SSH 执行长任务，以及在同一连接中切换多个 shell。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/screen-memo/screen-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

GNU Screen 提供可分离、可重新连接的终端会话。适合通过 SSH 执行长任务，以及在同一连接中切换多个 shell。

## 会话命令

```bash
screen -S deploy
screen -ls
screen -r deploy
screen -d -r deploy    # 先分离其他连接，再接入
screen -x deploy       # 多个客户端同时连接，会共享操作
screen -L -S deploy    # 启用会话日志
screen -wipe           # 清理已失效的会话记录
```

快捷键默认先按 **`Ctrl+A`，松开后再按表内按键**。

## 窗口与分屏

| 前缀后按键 | 作用 |
| --- | --- |
| `c` | 新建窗口 |
| `A` | 重命名当前窗口 |
| `n` / `p` | 下一个 / 上一个窗口 |
| `0` 到 `9` | 选择窗口编号 |
| `"` | 列出窗口并选择 |
| `S` | 上下分区 |
| `\|` | 左右分区 |
| `Tab` | 切换分区 |
| `X` | 关闭当前显示分区 |
| `k` | 终止当前窗口中的任务 |
| `d` | 分离会话，保持任务运行 |
| `?` | 帮助 |

新分区可能是空白的：按前缀后 `c` 启动 shell，或用 `"` 选择已有窗口。**显示分区与运行任务的窗口是两回事**，不要把关闭分区和终止窗口混淆。

## 回滚、复制和日志

| 操作 | 按键 |
| --- | --- |
| 进入回滚 / 复制模式 | 前缀后 `[` |
| 开始选择，再完成复制 | `Space`，移动光标，再 `Space` |
| 粘贴缓冲区 | 前缀后 `]` |
| 切换当前窗口日志 | 前缀后 `H` |
| 把字面的 Ctrl+A 传给程序 | 前缀后 `a` |

日志可能包含终端输出中的敏感信息，启用前确认记录位置和用途。

## 常用配置

`~/.screenrc` 示例：

```text
startup_message off
defscrollback 10000
```

会话不等于开机自启服务，主机重启或 Screen 被终止后，任务不会因此自动恢复。需要长期守护的程序应交给 systemd 等服务管理器。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/screen-memo/screen-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/29-GNU-Screen速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
