---
title: 登录 Shell 与非登录 Shell：配置文件加载顺序
sidebar_position: 19
description: 登录 shell 与非登录 shell 的触发方式差异、/etc/profile 与 ~/.bashrc 的加载链路、如何判断当前 shell 类型，以及怎样让两种 shell 的环境保持一致。
---

# 登录 Shell 与非登录 Shell：配置文件加载顺序

同样的命令在不同终端里表现不一致（别名失效、PATH 少了几个目录、环境变量没生效），十有八九是因为当前 shell 是"登录 shell"还是"非登录 shell"——两者加载的配置文件不同。

## 1. 两种进入方式

- **登录 Shell**：走完整登录流程得到的环境，如 SSH 登录、本地 tty 登录、`su - egon`（注意带 `-`）、`bash --login`。
- **非登录 Shell**：已经处在某个 shell 环境里，再直接起一个，如 `su egon`（不带 `-`）、`bash`、图形界面里新开的终端窗口、执行脚本。

## 2. 配置文件加载链路

以 RHEL / CentOS 系为例（bash）：

```text
登录 Shell：
    /etc/profile
      └── /etc/profile.d/*.sh
    ~/.bash_profile
      └── ~/.bashrc
            └── /etc/bashrc
    （CentOS 9.3 实测：/etc/bashrc 会额外被执行一次）

非登录 Shell（交互式）：
    ~/.bashrc
      └── /etc/bashrc
            └── /etc/profile.d/*.sh
```

几个关键点：

- 登录 shell 依次查找 `~/.bash_profile` → `~/.bash_login` → `~/.profile`，**只执行第一个存在的文件**，因此这三者通常只留一个。
- `/etc/profile.d/*.sh` 由 `/etc/profile` 逐个执行，是系统级环境变量（如语言、`PATH` 追加、`JAVA_HOME`）的推荐放置位置。
- 非登录但**交互式**的 shell 只读 `~/.bashrc`，RHEL 系的 `~/.bashrc` 内部再去加载 `/etc/bashrc`，而 `/etc/bashrc` 又会跑一遍 `/etc/profile.d/*.sh`——这就是"改完 `/etc/profile.d` 里某个脚本，新终端看起来也生效"的原因。
- Debian / Ubuntu 系的文件名不同：登录 shell 读 `/etc/profile` 与 `~/.profile`（没有 `~/.bash_profile` 时），非登录交互式 shell 读 `/etc/bash.bashrc` 与 `~/.bashrc`。跨发行版写脚本时不要硬依赖 `/etc/bashrc`。

## 3. 对比表

| 对比项 | 登录 Shell | 非登录 Shell |
|---|---|---|
| 触发方式 | SSH 登录、tty 登录、`su - user`、`bash --login` | 图形桌面里新开终端、`bash script.sh`、`su user`（不带 `-`） |
| 加载的配置文件 | `/etc/profile`、`/etc/profile.d/*.sh`、`~/.bash_profile`（或 `~/.bash_login`、`~/.profile`），并通常连锁到 `~/.bashrc`、`/etc/bashrc` | `~/.bashrc` → `/etc/bashrc` → `/etc/profile.d/*.sh`（RHEL 系） |
| 用途 | 初始化整个登录会话的环境（环境变量、`PATH` 等），一般只执行一次 | 初始化每个新开的交互式 shell（别名、函数、提示符） |
| 判断方法 | `echo $0` 输出前面带 `-`，如 `-bash`；`shopt login_shell` 显示 `login_shell on` | `echo $0` 正常显示 `bash`；`shopt login_shell` 显示 `off` |

## 4. 容易踩的坑

- **`su` 不带 `-` 不会重置环境**：`su egon` 只切身份，`PATH`、环境变量仍是原用户的，容易在排查"命令找不到"时被误导；需要干净环境就用 `su - egon`。
- **`ssh host "cmd"` 是非交互式 shell**：它既不读 `/etc/profile` 也不读 `~/.bashrc` 的交互段落。RHEL 系 `~/.bashrc` 开头通常有 `[ -z "$PS1" ] && return`，一旦命中就直接返回，于是"我明明配了环境变量，远程执行却拿不到"。这类场景应把变量写进 `~/.bash_profile` 能覆盖的位置，或显式 `ssh host 'source ~/.bashrc && cmd'`。
- **`screen` / `tmux`**：新开的窗口算非登录 shell，只有 `tmux new -s x` 后手动 `su -` 才是登录 shell。
- **登录 shell 只读一处 profile**：同时存在 `~/.bash_profile` 和 `~/.profile` 时，后者永远不会执行，这是配置长期不生效的常见原因。

## 5. 让两种 shell 行为一致

实践中希望"不管怎么进来，配置都生效"，通行做法是在 `~/.bash_profile` 里显式加载 `~/.bashrc`：

```bash
# ~/.bash_profile
[ -f ~/.bashrc ] && source ~/.bashrc
```

这样登录 shell 也会执行 `.bashrc` 中的别名、函数与提示符设置，两种 shell 的体验就统一了。

> 原则：**系统级、只在登录时算一次的东西放 `/etc/profile.d/`**（环境变量、`PATH`）；**每次开终端都该有的东西放 `~/.bashrc`**（别名、函数、提示符）。

## 小结

- 登录 shell：`/etc/profile` + `~/.bash_profile`，负责全局环境，只在登录时执行一次。
- 非登录 shell：`~/.bashrc`（RHEL 系再连锁 `/etc/bashrc`、`/etc/profile.d`），负责每个新终端的个性化配置。
- 排查"配置不生效"第一步永远是确认当前是哪种 shell（`echo $0` / `shopt login_shell`），再去对应文件里找。
