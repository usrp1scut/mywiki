---
title: "ZFS 存储池速查"
description: "区分 `zpool` 管理的存储池与 `zfs` 管理的数据集、卷和快照。示例池名为 `tank`，设备标识必须替换为已核对的实际磁盘。"
tags: [速查, Linux]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/zpool-memo/zpool.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

区分 `zpool` 管理的存储池与 `zfs` 管理的数据集、卷和快照。示例池名为 `tank`，设备标识必须替换为已核对的实际磁盘。

## 查看状态

```bash
zpool list
zpool status -v
zpool status -x
zpool iostat -v 5
zpool get all tank
zpool history tank
zfs list
zfs list -t snapshot
```

`status` 查看拓扑、错误和校验进度，`iostat` 查看吞吐与 I/O，`history` 用于追踪管理操作。

## 布局与创建前预览

| 结构 | 含义 |
| --- | --- |
| 单盘 vdev | 没有冗余 |
| mirror | 同一个 vdev 中保存镜像副本 |
| raidz1 / raidz2 / raidz3 | 同一 RAIDZ vdev 分别允许 1 / 2 / 3 块成员盘失效 |
| 多个顶层 vdev | 组合成一个池；任一必需数据 vdev 丢失都可能影响整个池 |

```bash
# -n 只预览，不创建
zpool create -n -o ashift=12 tank mirror \
  /dev/disk/by-id/<磁盘A> /dev/disk/by-id/<磁盘B>
```

确认设备、已有数据和备份后才考虑去掉 `-n`。`zpool add` 是增加顶层 vdev，不是给已有单盘补镜像；补镜像通常使用 `attach`。不要因为想扩容就盲目添加单盘 vdev。

## 维护与迁移

```bash
zpool scrub tank                  # 校验数据，有可用冗余时尝试修复
zpool status tank
zpool scrub -s tank               # 停止正在进行的 scrub
zpool export tank                 # 停止使用并导出池
zpool import                     # 列出可导入池
zpool import -d /dev/disk/by-id tank
```

导出会影响正在使用数据集的服务。不要直接用 `import -f` 抢占可能仍由另一台主机使用的池。更换故障盘前记录拓扑、设备序列号和冗余状态，按部署版本的 OpenZFS 手册操作。

## 数据集与属性

```bash
zfs create tank/app
zfs set compression=lz4 tank/app
zfs set quota=100G tank/app
zfs get compression,quota,mountpoint tank/app
```

属性可能由父数据集继承，`zfs get` 的 SOURCE 列能帮助辨别来源。配额约束可用空间，不会替代容量监控。

## 快照、克隆与复制

```bash
zfs snapshot tank/app@before-change
zfs list -t snapshot
zfs clone tank/app@before-change tank/app-test
zfs send tank/app@before-change > app-snapshot.zfs
zfs send -i tank/app@before-change tank/app@after-change > app-increment.zfs
```

增量发送前需先创建 `after-change` 快照。生产备份要验证目标端可恢复，并把备份放在独立故障域；池内快照本身不是异地备份。

`zfs rollback` 会丢弃目标快照之后的数据变化，`zfs destroy` 和 `zpool destroy` 会移除对象或池；这些不是清理空间的默认步骤。优先从快照恢复单个文件，或克隆后检查。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/zpool-memo/zpool.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/01-Linux/31-ZFS存储池速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
