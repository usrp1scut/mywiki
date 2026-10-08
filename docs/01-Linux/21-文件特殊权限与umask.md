---
title: 文件特殊权限（SUID/SGID/Sticky）与 umask
sidebar_position: 21
description: SUID、SGID、Sticky 三种特殊权限的作用范围与数字代号，ls -l 中的 s/S/t 标识含义，以及 umask 如何按位清除默认权限、决定新建文件与目录的最终权限。
---

# 文件特殊权限（SUID/SGID/Sticky）与 umask

Linux 权限除了读（4）、写（2）、执行（1）这 9 个位，还有三位"特殊权限"，以及一个决定新建文件默认权限的 `umask`。前者控制"以谁的身份执行""属组如何继承"，后者控制"默认给多少权限"。

## 一、SUID（Set User ID，数字代号 4）

作用于可执行程序。以系统已有的 `passwd` 为例：

效果：加了 SUID 的命令在启动时，其 **effective UID 变成该命令文件属主的身份**，而不是执行者的身份。

```bash
ls -l /usr/bin/passwd
-rwsr-xr-x 1 root root ... /usr/bin/passwd
```

普通用户执行它时，进程临时以 root 身份运行，因此才有权限去写 `/etc/shadow`；程序结束，提权随之消失。

几个要点：

- SUID 对**目录**无效（目录上的 SUID 位在 Linux 中被忽略）。
- Linux 内核忽略**解释器脚本**上的 SUID/SGID 位。
- 属主执行位有 `x` 时显示小写 `s`，没有时显示大写 `S`。大写只说明对应的执行位缺失，不能据此断言其他用户也无法执行。
- `nosuid` 挂载或 `no_new_privs` 等限制可能阻止 SUID 生效，参见[进程身份](./20-Linux进程的生命周期与身份.md)。
- 排查提权面时用 `find / -perm -4000 -type f 2>/dev/null` 列出所有 SUID 程序。

## 二、SGID（Set Group ID，数字代号 2）

**既可以给文件加，也可以给目录加**，目录上的用法更常见：

```bash
chmod g+s /aaa
# 或
chmod 2755 /aaa
```

对目录的效果：**后续在该目录下创建的文件和子目录，其属组都会继承 `/aaa` 目录的属组**，而不是通常使用的创建进程的有效组。这在协作目录里非常实用——多个用户共享一个目录，无需反复 `chown`/`chgrp`。

```text
/aaa 属组 dev
├── a.txt     # 属组自动为 dev
└── sub/      # 属组自动为 dev
```

对文件的 SGID 效果与 SUID 类似：执行时 effective GID 变为文件属组的 GID。

## 三、Sticky Bit（粘滞位，数字代号 1）

**给目录加**，典型用途是共享目录：

```bash
chmod o+t /share
# 或
chmod 1777 /share
```

效果：在满足目录访问权限的前提下，删除或改名还要求调用者是文件属主、目录属主，或具备相应特权。典型例子是 `/tmp`：

```bash
ls -ld /tmp
drwxrwxrwt 1 root root ... /tmp
```

没有粘滞位时，通常对目录同时有写入和搜索（`w+x`）权限即可删除其中的文件，并不要求对文件本身可写。Sticky 限制删除和改名，**不阻止别人修改可写文件的内容**。

## 四、三种特殊权限的数字代号

| 特殊权限 | 字母设置 | 数字代号 | 作用对象 |
|---|---|---|---|
| SUID | `chmod u+s` | 4 | 命令文件（可执行程序） |
| SGID | `chmod g+s` | 2 | 目录（属组继承）或文件 |
| Sticky | `chmod o+t` | 1 | 目录 |

特殊权限是**八进制的第一位**，叠加在普通三段权限之前：

```bash
chmod 0755 a.txt    # 普通权限 755
chmod 4755 a.txt    # 叠加 SUID
chmod 2755 a.txt    # 叠加 SGID
chmod 1755 a.txt    # 叠加 Sticky
chmod 7755 a.txt    # 三种特殊位同时设置（SUID + SGID + Sticky + 755），仅用于读懂数字
```

## 五、umask：新建文件与目录的默认权限

`umask` 决定"默认要屏蔽掉哪些权限位"，因此只能"收窄"，不能放宽。

### 为什么默认是 644 / 755

没有默认 ACL 时，新建权限取决于**程序请求的 mode 与进程的 umask**。常见工具通常请求：

- 文件：`666`（不请求执行位）
- 目录：`777`

实际权限 = 请求的 mode **按位清除** umask 中为 1 的位（即 `mode & ~umask`，不是简单相减）。程序也可以直接请求更严格的权限，例如 `600`：

```text
创建目录（上限 777）：
    777 022  -> 755
    777 000  -> 777
    777 066  -> 711

创建文件（上限 666）：
    666 066  -> 600
    666 023  -> 644
```

当 umask 为 `022`，且工具请求上述 mode 时，新建文件为 `644`、目录为 `755`。默认 umask 由登录环境或服务配置决定，不能只凭用户是不是 root 推断。

### 常用取值

| umask | 文件权限 | 目录权限 | 适用场景 |
|---|---|---|---|
| 022 | 644 | 755 | 常见默认值，他人可读 |
| 027 | 640 | 750 | 同组可读，其他用户无权限 |
| 077 | 600 | 700 | 私有文件，仅自己可见（家目录、密钥） |
| 002 | 664 | 775 | 团队协作目录，同组可写 |

### 临时与永久设置

```bash
umask            # 查看当前值
umask 027        # 当前 Shell 及随后启动的子进程使用此值

# 永久生效（RHEL 系）
# 系统级：/etc/profile、/etc/bashrc 中的 umask 行，或 /etc/profile.d/umask.sh
# 用户级：~/.bashrc
```

`umask` 不会追溯修改已有文件，后续 `chmod` 也可另行改变权限。它同样能屏蔽**属主**的权限，例如 `0666 & ~0200 = 0466`，会去掉属主写权限。

## 小结

| 机制 | 一句话理解 |
|---|---|
| SUID (4) | 执行时"变成文件属主"的权限运行，让普通用户完成受控的特权操作（如 `passwd`） |
| SGID (2) | 加在目录上时，目录内新建对象的属组继承本目录属组，便于团队协作 |
| Sticky (1) | 进一步限制目录项的删除/改名，允许文件属主、目录属主或特权进程（如 `/tmp`） |
| umask | 决定新建文件/目录默认能被别人看到多少，只能收窄不能放宽 |

安全建议：定期排查异常的 SUID/SGID 文件；共享目录用 SGID 统一属组、用 Sticky 防误删；`umask` 涉及敏感数据的用户建议设为 `077`。

校核依据：[Linux umask(2)](https://man7.org/linux/man-pages/man2/umask.2.html)、[execve(2)](https://man7.org/linux/man-pages/man2/execve.2.html)、[GNU 文件权限](https://www.gnu.org/software/coreutils/manual/html_node/Mode-Structure.html)。
