### 对外提供cephfs,需要先部署mds

```bash
#查看mds
ceph mds stat
#部署mds
ceph-deploy mds create vms83
```

### 创建两个池，一个存储数据，一个存储元数据

```bash
#池名没有限制，此处只是为了便于识别
ceph osd pool create ceph_data 64
ceph osd pool create ceph_metadata 64
```

### 创建fs

语法如下：

`ceph fs new <fs_name> <metadata> <data> {--force}`

```bash
 ceph fs new cephfs ceph_metadata ceph_data
 ceph osd pool application enable ceph_data cephfs
 ceph osd pool application enable ceph_metadata cephfs
```

默认只能创建一个fs,不建议创建多个，容易造成数据丢失。

```bash
#通过设置以下参数可创建多个fs
ceph fs flag set enable_multiple true
```

### 挂载

#### 使用ceph-fuse挂载

```bash
yum install ceph-fuse -y
#导出用户文件到客户机，详见用户管理章节
ceph auth get-or-create client.tom > /etc/ceph/ceph.client.tom.keyring
scp /etc/ceph/ceph.client.tom.keyring vms82:/etc/ceph/ceph.client.tom.keyring
#创建挂载目录
mkdir /cephfs
#挂载
ceph-fuse -m vms83:6789 /cephfs
```

#### 使用mount

ceph管理机上获取用户key

```bash
ceph auth get client.admin
```

客户机挂载

```bash
mount -t ceph -o name=admin,secret=AQCiLqNge1hUHBAArERlsXKEbREa4QrIcBIDAw== vms82:6789:/ /cephfs/
```

客户机写进fstab自动挂载

```bash
vi /etc/fstab

vms83:/ /cephfs  ceph    name=admin,secret=AQANeVZjpNHEBhAAzoneuMj2TxvzF63XTMBOjw==,_netdev 0 0
```

### 删除文件系统

```bash
#先停止mds才能删除
systemctl stop ceph-mds.target
systemctl disable ceph-mds.target
ceph fs rm cephfs --yes-i-really-mean-it
```

