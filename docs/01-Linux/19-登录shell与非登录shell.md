---
title: 登录 Shell 与非登录 Shell：配置文件加载顺序
sidebar_position: 19
description: 登录 shell 与非登录 shell 的触发方式差异、/etc/profile 与 ~/.bashrc 的加载链路、如何判断当前 shell 类型，以及怎样让两种 shell 的环境保持一致。
---

# 登录 Shell 与非登录 Shell：配置文件加载顺序

同样的命令在不同终端里表现不一致（别名失效、PATH 少了几个目录、环境变量没生效），可能与启动配置有关。**登录与交互是两个独立属性**；以下以 Bash 为例，不能把所有非登录 Shell 都当成交互式 Shell。

## 1. 两种进入方式

- **登录 Shell**：走完整登录流程得到的环境，如 SSH 登录、本地 tty 登录、`su - egon`（注意带 `-`）、`bash --login`。
- **非登录 Shell**：例如在终端里直接运行 `bash`，或使用 `bash script.sh` 执行脚本。前者通常是交互式，后者是非交互式；图形终端的登录属性取决于启动配置。

## 2. 配置文件加载链路

以 RHEL / CentOS 系常见的配置为例（Bash）：箭头表示配置文件里的显式加载关系，实际顺序以本机文件为准。

```text
登录 Shell：
    /etc/profile
      └── /etc/profile.d/*.sh
    ~/.bash_profile
      └── ~/.bashrc
            └── /etc/bashrc

非登录 Shell（交互式）：
    ~/.bashrc
      └── /etc/bashrc
            └── /etc/profile.d/*.sh（取决于 /etc/bashrc 的条件分支）
```

几个关键点：

- 登录 shell 依次查找 `~/.bash_profile` → `~/.bash_login` → `~/.profile`，**只执行第一个存在且可读的文件**，不会自动继续执行其余两个。
- `/etc/profile.d/*.sh` 通常由发行版的 `/etc/profile` 加载，可用于配置登录环境；这不是 Bash 直接读取所有 `.sh` 文件的固定规则。
- 非登录但**交互式**的 Bash 默认读取 `~/.bashrc`；RHEL 系通常由它加载 `/etc/bashrc`，是否继续加载 `/etc/profile.d/*.sh` 取决于文件内的条件。普通非交互式脚本默认不读 `.bashrc`，而是检查 `BASH_ENV` 指定的文件。
- Debian / Ubuntu 系常见配置使用 `/etc/bash.bashrc`；Bash 登录时没有可读的 `~/.bash_profile`、`~/.bash_login` 才会读取 `~/.profile`。跨发行版写脚本时不要硬依赖 `/etc/bashrc`。

## 3. 对比表

| 对比项 | 登录 Shell | 非登录 Shell |
|---|---|---|
| 触发方式 | 常规 SSH 登录、tty 登录、`su - user`、`bash --login` | 终端内运行 `bash`、`bash script.sh`、`su user`（不带 `-`） |
| 加载的配置文件 | `/etc/profile` 与首个可读的用户 profile；其他加载关系由配置脚本决定，非交互式时还检查 `BASH_ENV` | 交互式默认读 `~/.bashrc`；普通非交互式脚本检查 `BASH_ENV`，不默认读 `.bashrc` |
| 用途 | 每次启动登录 Shell 时初始化登录环境 | 交互式配置用于别名、函数、提示符；非交互式可执行脚本 |
| 判断方法 | `shopt login_shell` 显示 `on`；`$0` 不一定带 `-` | `shopt login_shell` 显示 `off`；`$-` 含 `i` 才表示交互式 |

## 4. 容易踩的坑

- **`su` 不带 `-` 不等于完整登录**：它通常保留部分原会话环境，具体变量如何重设受实现和系统配置影响。需要模拟目标用户的登录环境时使用 `su - egon`。
- **`ssh host "cmd"` 通常是非交互、非登录会话**：Bash 识别远程调用时可能读取 `.bashrc`，但其中的“非交互则 return”会跳过后续配置。只改 `.bash_profile` 无法保证此场景生效；应显式传入所需环境，或确认需要登录配置后使用 `bash -lc`。
- **`screen` / `tmux`**：启动哪种 Shell 取决于配置；tmux 的 `default-command` 为空时默认启动登录 Shell。进入窗口后用 `shopt login_shell` 确认。
- **登录 shell 只自动读取一处用户 profile**：同时存在可读的 `~/.bash_profile` 和 `~/.profile` 时，Bash 不会自动读取后者；前者可以显式加载它。

## 5. 让两种 shell 行为一致

希望登录与非登录的**交互式** Bash 共用别名、提示符等配置，可以在 `~/.bash_profile` 里显式加载 `~/.bashrc`：

```bash
# ~/.bash_profile
[ -r ~/.bashrc ] && source ~/.bashrc
```

这样登录 Shell 也能读取 `.bashrc`，但仍受文件内部条件控制；普通脚本和服务不会因此自动读取交互配置。

> 原则：登录环境可放在系统 profile 或用户 profile 中；交互配置放在 `.bashrc`。需要环境变量的服务和任务应按各自的启动方式配置，不能假设它们会读取个人 profile。

## 小结

- 登录 shell：读取 `/etc/profile` 与首个可读的用户 profile，每次启动登录 Shell 都会执行。
- 非登录 shell：交互式默认读取 `.bashrc`；普通非交互式脚本检查 `BASH_ENV`。
- 排查配置时先确认解释器，再用 `shopt login_shell` 和 `$-` 分别判断登录与交互属性。

校核依据：[Bash 启动文件](https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files.html)、[tmux 默认 Shell](https://man7.org/linux/man-pages/man1/tmux.1.html)。
