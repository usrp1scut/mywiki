# Linux 内核参数速查表

## 参数管理命令

| 命令 | 语法 | 描述 | 示例 |
|------|------|------|------|
| **sysctl** | `sysctl [选项] 参数[=值]` | 查看和修改内核参数 | `sysctl net.ipv4.ip_forward` |
| **临时修改** | `sysctl -w 参数=值` | 临时修改参数 | `sysctl -w vm.swappiness=10` |
| **永久修改** | 编辑 `/etc/sysctl.conf` | 永久修改参数 | `echo "vm.swappiness=10" >> /etc/sysctl.conf` |
| **生效配置** | `sysctl -p` | 重新加载配置文件 | `sysctl -p /etc/sysctl.conf` |
| **查看所有** | `sysctl -a` | 显示所有参数 | `sysctl -a \| grep tcp` |

## 网络相关参数

### IPv4 网络参数
| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `net.ipv4.ip_forward` | 0 | IP转发功能 | 1（路由器/网关） |
| `net.ipv4.tcp_syncookies` | 1 | SYN洪水攻击保护 | 1 |
| `net.ipv4.tcp_max_syn_backlog` | 1024 | SYN队列大小 | 8192 |
| `net.ipv4.tcp_fin_timeout` | 60 | FIN等待超时 | 30 |
| `net.ipv4.tcp_keepalive_time` | 7200 | Keepalive探测间隔 | 600 |
| `net.ipv4.tcp_keepalive_probes` | 9 | Keepalive探测次数 | 5 |
| `net.ipv4.tcp_keepalive_intvl` | 75 | Keepalive探测间隔 | 15 |

### 连接和端口
| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `net.core.somaxconn` | 4096 | 最大连接队列 | 65535 |
| `net.ipv4.tcp_max_tw_buckets` | 16384 | TIME_WAIT最大数量 | 180000 |
| `net.ipv4.ip_local_port_range` | 32768-60999 | 本地端口范围 | 1024-65000 |
| `net.ipv4.tcp_tw_reuse` | 0 | 重用TIME_WAIT连接 | 1 |
| `net.ipv4.tcp_tw_recycle` | 0 | 快速回收TIME_WAIT | 0（已废弃） |

### 缓冲区大小
| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `net.core.rmem_max` | 212992 | 最大接收缓冲区 | 16777216 |
| `net.core.wmem_max` | 212992 | 最大发送缓冲区 | 16777216 |
| `net.ipv4.tcp_rmem` | 4096 87380 6291456 | TCP接收缓冲区 | 4096 87380 16777216 |
| `net.ipv4.tcp_wmem` | 4096 16384 4194304 | TCP发送缓冲区 | 4096 16384 16777216 |

## 内存管理参数

### 虚拟内存
| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `vm.swappiness` | 60 | 交换倾向性 | 10-30 |
| `vm.overcommit_memory` | 0 | 内存分配策略 | 0或1 |
| `vm.overcommit_ratio` | 50 | 过度提交比率 | 80 |
| `vm.dirty_ratio` | 20 | 脏页比例阈值 | 10 |
| `vm.dirty_background_ratio` | 10 | 后台刷脏页阈值 | 5 |
| `vm.dirty_expire_centisecs` | 3000 | 脏页过期时间 | 500 |
| `vm.vfs_cache_pressure` | 100 | 文件系统缓存压力 | 50 |

### 透明大页
| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `vm.nr_hugepages` | 0 | 大页数量 | 根据需求设置 |
| `vm.hugetlb_shm_group` | 0 | 允许使用大页的组 | 0 |
| `transparent_hugepage` | always | 透明大页模式 | madvise或never |

## 文件系统参数

| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `fs.file-max` | 取决于内存 | 最大文件句柄数 | 2097152 |
| `fs.inotify.max_user_watches` | 8192 | inotify监视数上限 | 524288 |
| `fs.inotify.max_user_instances` | 128 | inotify实例数上限 | 1024 |
| `fs.aio-max-nr` | 65536 | 异步IO事件数 | 1048576 |

## 系统性能参数

### 进程和线程
| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `kernel.pid_max` | 32768 | 最大进程ID数 | 4194304 |
| `kernel.threads-max` | 取决于内存 | 最大线程数 | 2097152 |
| `vm.max_map_count` | 65530 | 最大内存映射区域 | 262144 |

### 信号量
| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `kernel.sem` | 250 32000 32 128 | 信号量设置 | 250 32000 100 128 |
| `kernel.msgmnb` | 16384 | 消息队列最大字节 | 65536 |
| `kernel.msgmax` | 8192 | 单条消息最大大小 | 65536 |

## 安全相关参数

| 参数 | 默认值 | 描述 | 推荐值 |
|------|--------|------|--------|
| `kernel.randomize_va_space` | 2 | ASLR地址空间随机化 | 2 |
| `net.ipv4.icmp_echo_ignore_all` | 0 | 忽略所有ping请求 | 0或1 |
| `net.ipv4.conf.all.accept_redirects` | 1 | 接受ICMP重定向 | 0 |
| `net.ipv4.conf.all.secure_redirects` | 1 | 接受安全重定向 | 0 |

## 实用脚本示例

```bash
#!/bin/bash
# 查看常用内核参数
echo "=== 网络参数 ==="
sysctl net.ipv4.ip_forward
sysctl net.core.somaxconn
sysctl net.ipv4.tcp_max_syn_backlog

echo "=== 内存参数 ==="
sysctl vm.swappiness
sysctl vm.overcommit_memory
sysctl vm.dirty_ratio

echo "=== 文件系统参数 ==="
sysctl fs.file-max
sysctl fs.inotify.max_user_watches

# 临时优化网络参数
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=8192
sysctl -w net.ipv4.tcp_fin_timeout=30

# 永久修改
cat >> /etc/sysctl.conf << EOF
# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_fin_timeout = 30

# 内存优化
vm.swappiness = 10
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5
EOF

# 生效配置
sysctl -p
```

## 参数文件位置

| 文件位置 | 描述 |
|----------|------|
| `/proc/sys/` | 内核参数虚拟文件系统 |
| `/etc/sysctl.conf` | 主配置文件 |
| `/etc/sysctl.d/*.conf` | 额外配置文件目录 |
| `/run/sysctl.d/*.conf` | 运行时配置文件 |
| `/usr/lib/sysctl.d/*.conf` | 系统预置配置文件 |

## 监控和调试

```bash
# 查看当前值
cat /proc/sys/net/ipv4/ip_forward

# 监控参数变化
watch -n 1 'sysctl net.ipv4.tcp_rmem'

# 查找特定参数
sysctl -a | grep tcp_mem

# 比较默认值和当前值
sysctl -a --system 2>/dev/null | grep -E "^(#|$)" -v > default.conf
sysctl -a > current.conf
diff default.conf current.conf
```

## 注意事项

1. **生产环境谨慎修改**：修改前备份配置文件
2. **测试验证**：修改后验证系统稳定性
3. **参数依赖**：某些参数相互依赖，需整体考虑
4. **硬件相关**：最佳值取决于硬件配置和工作负载
5. **内核版本**：不同内核版本参数可能有所不同

> 💡 **提示**：使用 `man sysctl` 和 `man proc` 查看详细文档