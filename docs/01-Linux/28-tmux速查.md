---
title: "tmux 速查"
description: "tmux 在一个终端中管理多个会话、窗口和窗格，SSH 断开后可以重新连接。会话仍依赖宿主机与 tmux 服务进程，不能代替服务管理和数据备份。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/tmux-memo/tmux-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

tmux 在一个终端中管理多个会话、窗口和窗格，SSH 断开后可以重新连接。会话仍依赖宿主机与 tmux 服务进程，不能代替服务管理和数据备份。

## 会话操作

```bash
tmux new -s deploy
tmux ls
tmux attach -t deploy
tmux new-session -A -s deploy  # 存在就连接，否则新建
tmux rename-session -t deploy ops
tmux kill-session -t ops      # 终止该会话中的任务
```

下表的「前缀」默认是 **先按 `Ctrl+B`，松开后再按下一键**。

## 窗口和窗格

| 前缀后按键 | 作用 |
| --- | --- |
| `d` | 分离会话，让任务继续运行 |
| `s` | 会话列表 |
| `c` | 新窗口 |
| `,` | 重命名窗口 |
| `n` / `p` | 下一个 / 上一个窗口 |
| `0` 到 `9` | 按编号选择窗口 |
| `w` | 会话与窗口树 |
| `%` | 左右分屏 |
| `"` | 上下分屏 |
| 方向键 | 移动到相邻窗格 |
| `o` | 轮换窗格 |
| `z` | 放大当前窗格 / 恢复布局 |
| `x` | 关闭当前窗格，会确认 |
| `?` | 查看按键绑定 |

## 回滚查看与复制

前缀后按 `[` 进入复制模式，按 `]` 粘贴 tmux 缓冲区。复制模式有两套常见按键：

| 动作 | vi 模式 | Emacs 模式 |
| --- | --- | --- |
| 开始选择 | `Space` | `Ctrl+Space` |
| 复制并退出 | `Enter` | `Alt+W` |
| 放弃选择并退出 | `q` | `Esc` |

`v` 和 `y` 并非可以假定存在的默认复制键；需要自行绑定。用 `tmux list-keys -T copy-mode-vi` 或 `-T copy-mode` 查看实际配置。参见 [tmux 手册](https://man7.org/linux/man-pages/man1/tmux.1.html)。

## 配置与脚本

以下配置写入 `~/.tmux.conf`，保留默认前缀：

```text
set -g mouse on
set -g history-limit 10000
setw -g mode-keys vi
```

```bash
tmux source-file ~/.tmux.conf
tmux show-options -g
tmux capture-pane -p -t deploy:0.0
tmux send-keys -t deploy:0.0 'make test' Enter
```

`send-keys` 会在目标窗格实际输入并执行命令，先确认目标会话。`kill-server` 会结束该服务下的所有会话，不宜用于退出单个终端。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/tmux-memo/tmux-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/28-tmux速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
