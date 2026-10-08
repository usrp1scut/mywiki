---
title: 进程的生命周期与身份：进程何时结束、权限由谁决定
sidebar_position: 20
description: 命令产生的进程在什么情况下结束（正常退出、信号、致命错误、父进程退出），退出码与僵尸进程的回收机制，以及 real/effective/saved UID 与 SUID 如何决定进程的运行权限。
---

# 进程的生命周期与身份：进程何时结束、权限由谁决定

两个看似基础但经常被问到的问题：一条命令产生的进程什么时候结束？这个进程到底以谁的身份在跑、凭什么能操作那些文件？前者关系到僵尸进程与信号处理，后者关系到 SUID 与提权模型。

## 一、进程何时结束

### 1. 正常执行完毕

程序执行到最后一条指令，`main` 函数 `return` 或主动调用 `exit()`，由内核回收资源，进程终止，退出码通常为 0。

### 2. 主动调用退出函数

- `exit()`：会先执行 `atexit` 注册的清理函数、刷新 stdio 缓冲区，再退出。
- `_exit()`：不运行 `atexit` 回调、不刷新 stdio 缓冲区；内核仍会关闭文件描述符等，常用于 `fork` 后子进程的失败退出路径。

两者都携带退出状态码：**0 表示成功，非 0 表示出错**，父进程通过 `wait()` 拿到，shell 里用 `$?` 查看。

### 3. 接收到终止信号

| 信号 | 编号 | 行为 |
|---|---|---|
| `SIGINT` | 2 | `Ctrl+C` 发出，请求中断当前前台进程 |
| `SIGTERM` | 15 | `kill` 默认信号，请求正常终止，进程可捕获并清理资源后退出 |
| `SIGKILL` | 9 | 不可被捕获或忽略，不运行用户态清理；不可中断等待期间可能无法立即退出 |
| `SIGHUP` | 1 | 终端挂断相关信号，默认终止；部分服务安装处理器将其用于重载配置 |

排查服务停不掉时，先 `kill -15` 给进程清理机会，确认无效再用 `kill -9`。

### 4. 运行时发生致命错误

如段错误（`SIGSEGV`，非法内存访问）、总线错误（`SIGBUS`）、浮点异常（`SIGFPE`，如除零），由内核或 CPU 异常机制强制终止进程。这类退出通常伴随 dmesg 中的记录或 core dump。

### 5. 父进程先退出

父进程退出通常不直接结束子进程。孤儿进程会被最近的子进程收割者（subreaper）或所在 PID 命名空间的 PID 1 接管。但会话挂断、程序约定的父进程死亡信号或服务管理策略可能使它退出，长期运行的服务宜交给 systemd 等管理器托管。

### 退出之后：僵尸进程

通常，子进程退出后会保留退出状态，等待父进程通过 `wait()` / `waitpid()` 回收，期间称为**僵尸进程（Zombie）**。显式将 `SIGCHLD` 设为 `SIG_IGN`，或使用 `SA_NOCLDWAIT` 时，可以不留下僵尸状态。

- 父进程长时间不回收 → `ps` 中状态为 `Z` 的进程堆积，占用 PID/进程表项。
- 僵尸进程无法被 `kill -9` 杀掉（它已经死了）。先定位父进程并修复回收逻辑；确需重启父服务时先评估影响，之后由接管进程负责回收。
- `ps -ef | grep defunct`、`ps aux | awk '$8 ~ /Z/'` 可用于定位。

## 二、进程的身份如何判定

决定权限的不是"谁敲的命令"，而是进程自己携带的一组用户/组 ID：

| 身份字段 | 作用 |
|---|---|
| real UID / GID（实际用户/组 ID） | 代表"是谁启动了这个进程"，通常是执行命令的登录用户，用于审计、以及判断谁有权操作该进程（如 `kill`） |
| effective UID / GID（有效用户/组 ID） | **内核做权限检查时主要看它**，实际决定进程运行时对文件与资源的访问权限 |
| saved UID / GID（保存的用户/组 ID） | 用于进程临时降权后还能恢复回原权限 |

### 普通情况（无 SUID）

启动一个程序时，新进程的 real UID = effective UID = 执行者的 UID。例如普通用户 bob 执行 `ls`，该 `ls` 进程的 real/effective UID 都是 bob，只能访问 bob 有权限的文件。

### 涉及 SUID 时

如果可执行文件设置了 **SUID 位**（`chmod u+s file`，`ls -l` 显示为 `rwsr-xr-x`），程序被执行时：

- effective UID 变成**文件所有者**的 UID，而不是执行者的 UID；
- real UID 仍然是实际执行者的 UID。

典型例子是 `passwd`：

```bash
-rwsr-xr-x 1 root root ... /usr/bin/passwd
```

普通用户 bob 执行 `passwd` 改自己密码时：

- real UID = bob（谁执行的）
- effective UID = root（因为 SUID，临时获得 root 权限）
- 于是 `passwd` 进程才有权限写入只有 root 能改的 `/etc/shadow`
- 程序执行完毕后进程结束，这个临时提权也随之消失

### 为什么需要 SUID

某些操作需要额外权限，SUID 是实现方式之一；Linux 也可以通过 capabilities 等机制授予特定能力。SUID 本身不会限制程序能做什么，程序必须自行检查调用者、约束操作并及时降权。

设置了 SUID 也不保证提权生效：`nosuid` 挂载、`no_new_privs` 等条件会让执行时忽略这些特殊位。文件权限、ACL、capabilities 和安全模块也会影响最终访问结果，不能只看一个 UID。

也正因如此，SUID 是提权排查的重点对象：

```bash
find / -perm -4000 -type f 2>/dev/null   # 列出系统所有 SUID 程序
```

任何来历不明的 SUID 文件（尤其属于普通用户、且是 shell/脚本解释器类程序）都值得高度警惕。

## 小结

- 进程结束的五种途径：正常退出、主动 `exit`、收到信号、运行时致命错误、父进程退出带来的连锁影响。
- 退出后通常等待父进程 `wait()` 回收；僵尸进程已结束，需要父进程或接管者回收。
- **effective UID/GID** 是权限判断的重要因素，仍需结合补充组、ACL 和安全策略。
- SUID/SGID 生效时会改变 effective UID/GID，程序需要自行约束获得的权限。

校核依据：[Linux wait(2)](https://man7.org/linux/man-pages/man2/wait.2.html)、[execve(2)](https://man7.org/linux/man-pages/man2/execve.2.html)、[_exit(2)](https://man7.org/linux/man-pages/man2/_exit.2.html)。
