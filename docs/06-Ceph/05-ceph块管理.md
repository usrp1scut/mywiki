### 设置pool属性为rbd

块管理通过rdb接口操作

```bash
ceph osd pool application enable pool1 rbd
ceph osd pool application get pool1
{
    "rbd": {}
}
```
### 查看块

```bash
#查看池里的块
rbd -p pool1 ls
#查看块属性
rbd --image pool1/block1 info
#输出
rbd image 'block1':
        #这个块的大小，为 2G
        size 2GiB in 512 objects 
        order 22 (4MiB objects)
        block_name_prefix: rbd_data.85c06b8b4567
        format: 2
        features: layering, exclusive-lock, object-map, fast-diff, deep-flatten
        flags: 
        create_timestamp: Sun Nov  6 20:09:11 2022
```

features 指定的是这个块所具备的功能是什么，这些功能的意思大概如下：
* layering: 分层支持 cloning。
* striping: 条带化 v2 用于加强性能，当前只有 librbd 支持。
* exclusive-lock: 支持独占锁
* object-map: 支持对象映射（依赖 exclusive-lock）
* fast-diff: 快速计算差异（依赖 object-map 和 exclusive-lock）
* deep-flatten: 支持快照扁平化操作
* journaling: 支持记录 IO 操作（依赖 exclusive-lock）
* data-pool: EC data pool 支持

要在客户端上使用这个块的话，我们需要关闭除了 layering 之外其他的所有的功能，

如何关闭和启用这些功能
```bash
#关闭
rbd feature disable pool1/block1 exclusive-lock, object-map, fast-diff, deep-flatten
#启用替换为enable即可
```

### 创建块

创建块的语法是：

`rbd create 池名/块名 --size 大小`

或者

`rbd create -p 池名 块名 --size 大小`

```bash
[root@vms81 ceph-install]# rbd create pool1/block1 --size 2048
[root@vms81 ceph-install]# rbd -p pool1 ls
block1
[root@vms81 ceph-install]# rbd create pool1/block2 --size 2048
[root@vms81 ceph-install]# rbd -p pool1 ls
block1
block2
```

### 删除块

删除某个块的语法是:

`rbd -p 池名 rm 块名`

或者

`rbd rm 池名/块名`

```bash
[root@vms81 ceph-install]# rbd -p pool1 rm block2
Removing image: 100% complete...done.
```

### 在客户端上使用块

把已移除的vms82作为客户端

```bash
#将管理权限配置下发到vms82
ceph-deploy --overwrite-conf admin vms82
```

映射块到本地，映射的语法是

`rbd map --image 池名/块名`

```bash
#将block1映射到vms82
[root@vms82 ~]# rbd map --image pool1/block1
/dev/rbd0
#取消映射为
#rbd unmap --image pool1/block1
[root@vms82 ~]# rbd showmapped
id pool  image  snap device    
0  pool1 block1 -    /dev/rbd0 
```

重启系统之后，是不会自动给我们做映射的。如果希望开机能自动做映射的话，我们需要编辑`/etc/ceph/rbdmap`，在此文件里的格式为：

`池名/块名 id=用户名,keyring=/etc/ceph/用户的 keyring 文件`

例如：`pool1/block1 id=admin,keyring=/etc/ceph/ceph.client.admin.keyring`

这句话的意思是，开机的时候，自动的把 pool1 里的 block1 给我做映射，使用 admin 这个用户，admin 的密钥文件是`/etc/ceph/ceph.client.admin.keyring` 。

因为现在还只有一个管理员，没有其他用户，所以我们暂且只使用管理员来做。所以在`/etc/ceph/rbdmap` 里添加如下内容：

```
pool1/block1 id=admin,keyring=/etc/ceph/ceph.client.admin.keyring
```

并启动一个服务

```bash
systemctl enable rbdmap --now
```

### 初始化和挂载块

创建文件系统

```bash
[root@vms82 ~]# mkfs.xfs /dev/rbd0
meta-data=/dev/rbd0              isize=512    agcount=9, agsize=64512 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=0, sparse=0
data     =                       bsize=4096   blocks=524288, imaxpct=25
         =                       sunit=1024   swidth=1024 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=8 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
```

挂载

```bash
mkdir /123

mount /dev/rbd0 /123
```

查看挂载结果

```bash
[root@vms82 ~]# df -h
文件系统        容量  已用  可用 已用% 挂载点
/dev/sda1       150G  2.2G  148G    2% /
devtmpfs        2.0G     0  2.0G    0% /dev
tmpfs           2.0G     0  2.0G    0% /dev/shm
tmpfs           2.0G   17M  2.0G    1% /run
tmpfs           2.0G     0  2.0G    0% /sys/fs/cgroup
tmpfs           394M     0  394M    0% /run/user/0
/dev/rbd0       2.0G   33M  2.0G    2% /123
```

配置自动挂载(需先配置自动映射)

```
[root@vms82 ~]# cat /etc/fstab 

#
# /etc/fstab
# Created by anaconda on Thu Oct 18 23:09:54 2018
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#
UUID=9875fa5e-2eea-4fcc-a83e-5528c7d0f6a5 /                       xfs     defaults        0 0
UUID=16eb815a-8221-4e2e-8bed-c2e74bd2368e swap                    swap    defaults        0 0
#增加下面这行
/dev/rbd0    /123         xfs           defaults,_netdev                 0 0 
```

### 扩展块

扩展的语法：

`rbd resize --image 池名/块名 --size 新的大小`

```bash
rbd resize --image pool1/block1 --size 4096
#扩完块再到客户机上扩展文件系统
xfs_growfs /dev/rbd0
```

### 重命名块

不允许将块重命名到不同的池，如`rbd rename pool1/block2 pool2/blockx`，剪切也一样
```bash
rbd create pool1/block2 --size 2048
rbd rename pool1/block2 pool1/blockx
rbd -p pool1 ls
```
### 复制块

```bash
[root@vms81 ~]# rbd cp pool1/block2 pool2/block2
Image copy: 100% complete...done.
```
### 回收块

避免误删，可以将块先放到回收站

```bash
#回收
[root@vms81 ~]# rbd trash mv pool2/block2
#查看回收站
[root@vms81 ~]# rbd trash -p pool2 ls
85fe6b8b4567 block2
#恢复
[root@vms81 ~]# rbd trash -p pool2 restore 85fe6b8b4567
#彻底删除
[root@vms81 ~]# rbd trash -p pool2 rm 85fe6b8b4567
Removing image: 100% complete...done.
```
### 快照

基本操作
```bash
#查看快照
[root@vms81 ~]# rbd snap ls pool1/block1
#创建快照，语法rbd snap create 池/块@快照名
[root@vms81 ~]# rbd snap create pool1/block1@s_block
[root@vms81 ~]# rbd snap ls pool1/block1
SNAPID NAME    SIZE TIMESTAMP                
     4 s_block 4GiB Mon Nov  7 21:09:47 2022 
#恢复快照，语法rbd snap rollback 池/块@快照名，恢复快照前客户端应先取消挂载
[root@vms81 ~]# rbd snap rollback pool1/block1@s_block
Rolling back to snapshot: 100% complete...done.
#删除快照
[root@vms81 ~]# rbd snap purge pool2/block1
Removing all snapshots: 100% complete...done.
```

从快照克隆出块

```bash
#克隆前须对快照设置写保护
[root@vms81 ~]# rbd snap protect pool1/block1@s_block
#克隆快照为块
[root@vms81 ~]# rbd clone pool1/block1@s_block pool1/clone_block
#解除克隆块与快照关联
[root@vms81 ~]# rbd flatten pool1/clone_block
Image flatten: 100% complete...done.
#解除快照写保护
[root@vms81 ~]# rbd snap unprotect pool1/block1@s_block
```

### 导入导出块

```bash
[root@vms81 ~]# rbd export pool1/block1 block1-1.data
Exporting image: 100% complete...done.
[root@vms81 ~]# ls
anaconda-ks.cfg  block1-1.data  ceph-install  set.sh
[root@vms81 ~]# rbd import block1-1.data pool2/block1
Importing image: 100% complete...done.
```

增量备份导出和恢复

```bash
#修改后创建快照1
[root@vms81 ~]# rbd snap create pool1/block1@s_block1
#再次修改后窗建快照2
[root@vms81 ~]# rbd snap create pool1/block1@s_block2
#导出到快照1的增量备份
[root@vms81 ~]# rbd export-diff pool1/block1@s_block1 a.data
Exporting image: 100% complete...done.
[root@vms81 ~]# ls
a.data  anaconda-ks.cfg  block1-1.data  ceph-install  set.sh
#导出到快照2的增量备份
[root@vms81 ~]# rbd export-diff --from-snap s_block1 pool1/block1@s_block2 b.data
Exporting image: 100% complete...done.
#导入初始备份
[root@vms81 ~]# rbd import block1-1.data pool2/block1
rbd: image creation failed
Importing image: 0% complete...failed.
2022-11-07 21:33:05.542321 7f959d1a6d40 -1 librbd: rbd image block1 already exists
rbd: import failed: (17) File exists
#增量导入备份1
[root@vms81 ~]# rbd import-diff a.data pool2/block1
Importing image diff: 100% complete...done.
#增量导入备份2
[root@vms81 ~]# rbd import-diff b.data pool2/block1
Importing image diff: 100% complete...done.
```

挂载验证

```bash
[root@vms81 ~]# rbd feature disable pool2/block1 exclusive-lock, object-map, fast-diff, deep-flatten
[root@vms82 123]# rbd map --image pool2/block1
/dev/rbd2
[root@vms82 123]# mkdir /333
[root@vms82 123]# mount /dev/rbd2 /333/
[root@vms82 /]# umount /123
[root@vms82 /]# mount /dev/rbd2 /333/
[root@vms82 /]# ls /333
11111  222222  33333
```