---
title: sudo 权限的分配与管理：从 ALL 到最小权限
sidebar_position: 18
description: 公司环境下 sudo 权限的分配思路：按角色分组、把权限限定到具体命令、用 sudoers.d 分文件维护、谨慎使用 NOPASSWD，并结合 visudo 校验与日志审计。
---

# sudo 权限的分配与管理：从 ALL 到最小权限

日常排查问题时最常见的需求是"给某人一点 sudo 权限"。一旦图省事写成 `ALL=(ALL) ALL`，就等价于把完整 root 交出去，后续无法收敛。所以分配 sudo 权限的核心原则只有一句：**最小权限（Least Privilege）——只给用户完成本职工作所必需的那几条命令，而不是完整的 root 权限。**

## 1. 配置文件的位置

sudo 规则写在 `/etc/sudoers` 中，但生产上更推荐把不同角色的规则拆到 `/etc/sudoers.d/` 下的独立文件里：

- `/etc/sudoers`：保留系统默认的 `Defaults`、`root`、`%wheel` 等条目，尽量不动。
- `/etc/sudoers.d/<角色名>`：每个角色（或每套系统）一个文件，便于按需增删、按文件回溯变更。

配套要求：`/etc/sudoers` 中需要有 `#includedir /etc/sudoers.d` 这一行（默认已开启）；被包含的目录和文件不应该有 `.` 或 `~` 结尾的文件名，否则会被忽略。

## 2. 按角色 / 岗位分组授权

先用 `groupadd` 建角色组，再把用户挂进组（`usermod -aG devops alice`），规则只针对组写一次：

```bash
# /etc/sudoers.d/roles
# 运维组：管理类权限较大，几乎全量
%devops    ALL=(ALL)       ALL

# 开发组：只能重启/查看自己负责的服务，且免密，便于脚本调用
%developer ALL=(ALL)       NOPASSWD: /usr/bin/systemctl restart myapp, \
                                       /usr/bin/systemctl status myapp

# DBA 组：只能以 postgres 身份操作数据库，不能以 root 身份做别的事
%dba       ALL=(postgres)  /usr/bin/psql
```

常见的角色划分：

| 角色 | 权限范围 |
|---|---|
| 运维 / SRE | 较大权限，管理系统服务、网络、监控等 |
| 开发人员 | 仅能重启 / 查看自己负责的应用服务、查日志 |
| DBA | 仅限数据库相关操作，通常以 `(postgres)` 这类受限身份执行 |
| 安全 / 审计 | 只读权限，可查看日志与配置，但不能修改 |

注意 `%devops ALL=(ALL) ALL` 这类条目只应留给极少数人。组越大，越应该往下压缩命令范围。

## 3. 把权限限定到具体命令，而不是 `ALL`

sudo 的规则语法是 `用户 主机=(目标身份) 命令列表`，命令写全绝对路径，多个命令用逗号分隔，行尾 `\` 可续行：

```bash
# /etc/sudoers.d/nginx-ops
alice ALL=(root) /usr/bin/systemctl restart nginx, /usr/bin/systemctl status nginx
```

这样 alice 只能重启和查看 nginx，无法执行其他任意 root 命令。

两个必须注意的点：

- **必须写绝对路径**，因为 sudo 校验的是完整命令路径，写 `systemctl` 无法精确匹配。
- **受控命令本身也是攻击面**。`systemctl`、`vi`、`less`、`find`、`tar`、`awk` 这类命令都能直接或间接拿到 shell（例如 `vim` 中 `:!bash`），把它们交给普通用户等于变相给了 root。能只给 `restart/status` 子命令就不要给整条命令。

## 4. 用 `%group` 管理，而不是逐人写规则

给个人单独写规则的问题在于：人一多就无法审计，权限回收时容易漏。做法是把用户加入 Linux 组（`usermod -aG devops alice`），只在 sudoers 里维护组规则。这样：

- 新增成员只是加组操作，不改 sudo 配置；
- 离职或转岗时从组里移除即可回收权限；
- `id alice`、`groups alice` 就能查清某人到底继承了哪些权限。

## 5. `NOPASSWD` 要谨慎

`NOPASSWD` 免密适用于自动化：CI/CD 流水线、定时脚本、部署工具里无法交互输入密码的场景。但它同时去掉了"本人确认"这一道门槛，所以范围必须严格限定——只能配到具体命令（最好具体到子命令），绝不能出现 `NOPASSWD: ALL`。

```bash
# 可接受：只允许流水线免密重载特定服务
%ci-runner ALL=(root) NOPASSWD: /usr/bin/systemctl reload myapp

# 危险：等于免密 root
%ci-runner ALL=(root) NOPASSWD: ALL
```

## 6. 用 `visudo` 编辑，避免语法错误

sudoers 是"改坏就彻底失效"的配置文件：一个语法错误会导致所有 sudo 调用报错，极端情况下连修回来的机会都没有。

```bash
visudo                 # 编辑 /etc/sudoers（保存时自动做语法检查）
visudo -f /etc/sudoers.d/custom   # 编辑独立文件，同样带语法检查
visudo -c              # 只做语法检查，不编辑
```

`visudo` 会在保存时校验语法、并对并发编辑加锁。生产上还应在改完之后用一个非关键账号实测一次 `sudo -l` 与目标命令。

## 7. 配合日志与审计

sudo 的每次授权使用都会留下记录：

- RHEL / CentOS 系：`/var/log/secure`
- Debian / Ubuntu 系：`/var/log/auth.log`
- `journalctl -t sudo` 也可以直接过滤

典型记录包含执行者、目标身份、执行的完整命令和所在终端。大公司通常还会把这类日志接入集中式日志系统（ELK、Splunk 等），实现"谁在什么时间以什么身份执行了什么命令"的可追溯审计。

## 小结

分配思路可以固化为一条流水线：

> 按**角色分组** → 组内只授予**最小必需命令** → 通过 `sudoers.d` 分文件维护 → 用 `visudo` 保证配置可改可回滚 → 结合**日志审计**保证可追溯。

直接给完整 root 或 `ALL=(ALL) ALL` 看起来省事，但代价是权限无法收敛、事故无法定责，长期成本更高。
