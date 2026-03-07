# Linux 常用内核参数调优速查

> 目标：快速定位常用 sysctl 参数、推荐值和落地方式。  
> 说明：推荐值需结合业务负载与内核版本验证。

## 1. 参数管理命令

| 命令 | 语法 | 说明 | 示例 |
|---|---|---|---|
| 查看参数 | `sysctl 参数` | 查看单个参数 | `sysctl net.ipv4.ip_forward` |
| 临时修改 | `sysctl -w 参数=值` | 重启后失效 | `sysctl -w vm.swappiness=10` |
| 永久修改 | 编辑 `/etc/sysctl.conf` 或 `/etc/sysctl.d/*.conf` | 持久生效 | `echo "vm.swappiness=10" >> /etc/sysctl.d/tune.conf` |
| 加载配置 | `sysctl -p` | 重新加载配置文件 | `sysctl -p /etc/sysctl.d/tune.conf` |
| 查看全部 | `sysctl -a` | 列出全部参数 | `sysctl -a \| grep tcp` |

---

## 2. 网络相关参数

### 2.1 IPv4

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---:|---|---|
| `net.ipv4.ip_forward` | 0 | IP 转发 | 1（路由/网关场景） |
| `net.ipv4.tcp_syncookies` | 1 | SYN Flood 保护 | 1 |
| `net.ipv4.tcp_max_syn_backlog` | 1024 | SYN 队列大小 | 8192 |
| `net.ipv4.tcp_fin_timeout` | 60 | FIN 等待超时（秒） | 30 |
| `net.ipv4.tcp_keepalive_time` | 7200 | Keepalive 首次探测间隔 | 600 |
| `net.ipv4.tcp_keepalive_probes` | 9 | Keepalive 探测次数 | 5 |
| `net.ipv4.tcp_keepalive_intvl` | 75 | Keepalive 探测间隔 | 15 |

### 2.2 连接与端口

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---|---|---|
| `net.core.somaxconn` | 4096 | 最大连接队列 | 65535 |
| `net.ipv4.tcp_max_tw_buckets` | 16384 | TIME_WAIT 上限 | 180000 |
| `net.ipv4.ip_local_port_range` | `32768 60999` | 本地端口范围 | `1024 65000` |
| `net.ipv4.tcp_tw_reuse` | 0 | 重用 TIME_WAIT | 1 |
| `net.ipv4.tcp_tw_recycle` | 0 | 快速回收 TIME_WAIT | **0（已废弃）** |

### 2.3 缓冲区

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---|---|---|
| `net.core.rmem_max` | 212992 | 最大接收缓冲区 | 16777216 |
| `net.core.wmem_max` | 212992 | 最大发送缓冲区 | 16777216 |
| `net.ipv4.tcp_rmem` | `4096 87380 6291456` | TCP 接收缓冲区 | `4096 87380 16777216` |
| `net.ipv4.tcp_wmem` | `4096 16384 4194304` | TCP 发送缓冲区 | `4096 16384 16777216` |

---

## 3. 内存与文件系统参数

### 3.1 虚拟内存

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---:|---|---|
| `vm.swappiness` | 60 | 交换倾向 | 10~30 |
| `vm.overcommit_memory` | 0 | 内存分配策略 | 0 或 1 |
| `vm.overcommit_ratio` | 50 | 过度提交比率 | 80 |
| `vm.dirty_ratio` | 20 | 脏页上限比例 | 10 |
| `vm.dirty_background_ratio` | 10 | 后台刷脏阈值 | 5 |
| `vm.dirty_expire_centisecs` | 3000 | 脏页过期时间 | 500 |
| `vm.vfs_cache_pressure` | 100 | inode/dentry 回收压力 | 50 |

### 3.2 透明大页

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---|---|---|
| `vm.nr_hugepages` | 0 | 大页数量 | 按场景设置 |
| `vm.hugetlb_shm_group` | 0 | 允许大页的组 | 按需 |
| `transparent_hugepage` | `always` | 透明大页模式 | `madvise` 或 `never` |

### 3.3 文件系统

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---|---|---|
| `fs.file-max` | 依内存而定 | 最大文件句柄数 | 2097152 |
| `fs.inotify.max_user_watches` | 8192 | watch 上限 | 524288 |
| `fs.inotify.max_user_instances` | 128 | inotify 实例上限 | 1024 |
| `fs.aio-max-nr` | 65536 | AIO 事件上限 | 1048576 |

---

## 4. 系统与安全参数

### 4.1 进程/线程

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---|---|---|
| `kernel.pid_max` | 32768 | 最大 PID | 4194304 |
| `kernel.threads-max` | 依内存而定 | 最大线程数 | 2097152 |
| `vm.max_map_count` | 65530 | 最大内存映射区域 | 262144 |

### 4.2 信号量/消息队列

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---|---|---|
| `kernel.sem` | `250 32000 32 128` | 信号量配置 | `250 32000 100 128` |
| `kernel.msgmnb` | 16384 | 消息队列最大字节 | 65536 |
| `kernel.msgmax` | 8192 | 单消息最大大小 | 65536 |

### 4.3 安全

| 参数 | 默认值 | 说明 | 推荐值 |
|---|---:|---|---|
| `kernel.randomize_va_space` | 2 | ASLR 地址随机化 | 2 |
| `net.ipv4.icmp_echo_ignore_all` | 0 | 忽略 Ping | 0 或 1 |
| `net.ipv4.conf.all.accept_redirects` | 1 | 接受 ICMP 重定向 | 0 |
| `net.ipv4.conf.all.secure_redirects` | 1 | 接受安全重定向 | 0 |

---

## 5. 一份可直接套用的示例

```bash
#!/bin/bash

# 临时优化
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=8192
sysctl -w net.ipv4.tcp_fin_timeout=30
sysctl -w vm.swappiness=10
sysctl -w vm.dirty_ratio=10
sysctl -w vm.dirty_background_ratio=5

# 永久配置
cat >/etc/sysctl.d/99-performance.conf <<'CONF'
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_fin_timeout = 30
vm.swappiness = 10
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5
CONF

# 生效
sysctl -p /etc/sysctl.d/99-performance.conf
```

---

## 6. 参数文件位置

| 文件路径 | 说明 |
|---|---|
| `/proc/sys/` | 内核参数虚拟文件系统 |
| `/etc/sysctl.conf` | 主配置文件 |
| `/etc/sysctl.d/*.conf` | 自定义配置目录（推荐） |
| `/run/sysctl.d/*.conf` | 运行时配置 |
| `/usr/lib/sysctl.d/*.conf` | 系统预置配置 |

---

## 7. 常用排查命令

```bash
# 查看单项
cat /proc/sys/net/ipv4/ip_forward

# 持续观察
watch -n 1 'sysctl net.ipv4.tcp_rmem'

# 过滤查找
sysctl -a | grep -E 'tcp|somaxconn|max_map_count'
```

---

## 8. 注意事项

1. 生产环境修改前先备份配置
2. 每次调整后都要做压测/回归验证
3. 参数之间存在联动，建议成组调优
4. 推荐值与硬件、内核版本、业务模型强相关

> 提示：可通过 `man sysctl`、`man proc` 获取参数细节。
