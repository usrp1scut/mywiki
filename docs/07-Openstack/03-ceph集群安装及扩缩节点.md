## 系统环境

### ceph架构
![ceph架构图](/img/ceph.drawio.png)
### 系统配置

3台CentOS 7 server，除系统盘每台额外添加3块硬盘

![vm-demo](/img/ceph-vmdemo.png)

### 规划
* vms81 192.168.26.81  同时用作部署节点  

* vms82 192.168.26.82  同时用作删除节点实验

* vms83 192.168.26.83  初始部署时不纳入ceph集群，用作扩容实验
## 安装部署

### 所有节点都需要安装的部分

#### 修改hosts

```bash
[root@vms81 ceph-install]# cat /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
192.168.26.81 vms81.rhce.cc vms81
192.168.26.82 vms82.rhce.cc vms82
192.168.26.83 vms83.rhce.cc vms83
```

#### 配置部署节点vms81免密登录所有节点

```bash
ssh-keygen -N ""
ssh-copy-id vms81
ssh-copy-id vms82
ssh-copy-id vms83
```

#### 配置yum源

```bash
#清空原来自带配置文件：
cd /etc/yum.repos.d/
mkdir /tmp/bak
mv * /tmp/bak/
#配置系统源码，epel源：

curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
yum install wget -y
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
```

#### 安装软件包

```bash
yum install ceph.x86_64 ceph-base.x86_64 ceph-common.x86_64 ceph-deploy.noarch ceph-mds.x86_64 ceph-mon.x86_64 ceph-osd.x86_64 ceph-radosgw.x86_64 -y
```

### 创建集群，部署节点vms81上操作

创建一个目录用于存放部署的配置文件等并进入该目录下

```bash
mkdir ceph-install
cd ceph-install
```

部署集群

```bash
ceph-deploy new vms81 vms82
```

会在当前目录生成ceph.conf，修改配置

```bash
[root@vms81 ceph-install]# cat ceph.conf
[global]
fsid = fd9ca7c9-912a-4805-834e-25ee9a43074d
#mon的初始化配置
mon_initial_members = vms81, vms82
mon_host = 192.168.26.81,192.168.26.82

auth_cluster_required = cephx
auth_service_required = cephx
auth_client_required = cephx

#增加以下配置
public_network = 192.168.26.0/24
osd_pool_default_size = 1  #副本数
osd_pool_default_min_size = 1   #最小副本数
mon_osd_full_ratio = .85

#在这里我们单独加上 mon_osd_full_ratio = .85 的目的是，集群创建好之后健康状态是 err 的，为我们后面修改参数做准备用的。



```

创建mon

```bash
ceph-deploy mon create-initial   #会依据ceph.conf的配置初始化mon
```

将配置文件和密钥分发到各节点

```bash
ceph-deploy admin vms81 vms82
```

#### 创建osd

每个节点上都有三块新硬盘

```bash
fdisk -l

磁盘 /dev/sda：214.7 GB, 214748364800 字节，419430400 个扇区
Units = 扇区 of 1 * 512 = 512 bytes
扇区大小(逻辑/物理)：512 字节 / 512 字节
I/O 大小(最小/最佳)：512 字节 / 512 字节
磁盘标签类型：dos
磁盘标识符：0x0008febd

   设备 Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048   314574847   157286400   83  Linux
/dev/sda2       314574848   335546367    10485760   82  Linux swap / Solaris

磁盘 /dev/sdb：32.2 GB, 32212254720 字节，62914560 个扇区
Units = 扇区 of 1 * 512 = 512 bytes
扇区大小(逻辑/物理)：512 字节 / 512 字节
I/O 大小(最小/最佳)：512 字节 / 512 字节


磁盘 /dev/sdc：32.2 GB, 32212254720 字节，62914560 个扇区
Units = 扇区 of 1 * 512 = 512 bytes
扇区大小(逻辑/物理)：512 字节 / 512 字节
I/O 大小(最小/最佳)：512 字节 / 512 字节


磁盘 /dev/sdd：32.2 GB, 32212254720 字节，62914560 个扇区
Units = 扇区 of 1 * 512 = 512 bytes
扇区大小(逻辑/物理)：512 字节 / 512 字节
I/O 大小(最小/最佳)：512 字节 / 512 字节

```

```bash
#语法：ceph-deploy osd create --data /dev/sdX 节点名
ceph-deploy osd create --data /dev/sdb vms81
ceph-deploy osd create --data /dev/sdc vms81
ceph-deploy osd create --data /dev/sdd vms81
ceph-deploy osd create --data /dev/sdb vms82
ceph-deploy osd create --data /dev/sdc vms82
ceph-deploy osd create --data /dev/sdd vms82
```

用脚本自动创建

```bash
for i in 81 82 ; do for n in b c d ; do ceph-deploy osd create --data /dev/sd$n vms$i;done;done
```

创建完成

#### 查看集群

```bash
[root@vms81 ceph-install]# ceph osd tree
ID CLASS WEIGHT  TYPE NAME      STATUS REWEIGHT PRI-AFF 
-1       0.17578 root default                           
-3       0.08789     host vms81                         
 0   hdd 0.02930         osd.0      up  1.00000 1.00000 
 1   hdd 0.02930         osd.1      up  1.00000 1.00000 
 2   hdd 0.02930         osd.2      up  1.00000 1.00000 
-5       0.08789     host vms82                         
 3   hdd 0.02930         osd.3      up  1.00000 1.00000 
 4   hdd 0.02930         osd.4      up  1.00000 1.00000 
 5   hdd 0.02930         osd.5      up  1.00000 1.00000
 ```

 ## 扩容节点

 在部署节点vms81上操作
 
### 创建 mon
```bash
ceph-deploy mon create vms83
```
 
### 创建 OSD
```bash
for n in b c d ; do ceph-deploy osd create --data /dev/sd$n vms83;done
```

### 把密钥同步过去

```
ceph-deploy admin vms83
```

## 删除节点

### 删除OSD

在对应节点上停止对应的OSD服务
```bash
systemctl status |grep osd

           │     └─13133 grep --color=auto osd
             ├─system-ceph\x2dosd.slice
             │ ├─ceph-osd@5.service
             │ │ └─13023 /usr/bin/ceph-osd -f --cluster ceph --id 5 --setuser ceph --setgroup ceph
             │ ├─ceph-osd@4.service
             │ │ └─12578 /usr/bin/ceph-osd -f --cluster ceph --id 4 --setuser ceph --setgroup ceph
             │ └─ceph-osd@3.service
             │   └─12135 /usr/bin/ceph-osd -f --cluster ceph --id 3 --setuser ceph --setgroup ceph

systemctl stop ceph-osd@5.service
systemctl stop ceph-osd@4.service
systemctl stop ceph-osd@3.service

systemctl disable ceph-osd@5.service
systemctl disable ceph-osd@4.service
systemctl disable ceph-osd@3.service
```

### 在部署节点上，标记对应osd为out

目的是使这些 OSD 上面已经分配的 pg 迁移到其他的 OSD 上

```bash
[root@vms81 ceph-install]# ceph osd out osd.5
marked out osd.5. 
[root@vms81 ceph-install]# ceph osd out osd.4
marked out osd.4. 
[root@vms81 ceph-install]# ceph osd out osd.3
marked out osd.3. 
[root@vms81 ceph-install]# ceph osd tree
ID CLASS WEIGHT  TYPE NAME      STATUS REWEIGHT PRI-AFF 
-1       0.26367 root default                           
-3       0.08789     host vms81                         
 0   hdd 0.02930         osd.0      up  1.00000 1.00000 
 1   hdd 0.02930         osd.1      up  1.00000 1.00000 
 2   hdd 0.02930         osd.2      up  1.00000 1.00000 
-5       0.08789     host vms82                         
 3   hdd 0.02930         osd.3    down        0 1.00000 
 4   hdd 0.02930         osd.4    down        0 1.00000 
 5   hdd 0.02930         osd.5    down        0 1.00000 
-7       0.08789     host vms83                         
 6   hdd 0.02930         osd.6      up  1.00000 1.00000 
 7   hdd 0.02930         osd.7      up  1.00000 1.00000 
 8   hdd 0.02930         osd.8      up  1.00000 1.00000 
```

### 从 crush map 上删除这些 OSD

```bash
[root@vms81 ceph-install]# ceph osd crush remove osd.5
removed item id 5 name 'osd.5' from crush map
[root@vms81 ceph-install]# ceph osd crush remove osd.4
removed item id 4 name 'osd.4' from crush map
[root@vms81 ceph-install]# ceph osd crush remove osd.3
removed item id 3 name 'osd.3' from crush map
[root@vms81 ceph-install]# ceph osd tree
ID CLASS WEIGHT  TYPE NAME      STATUS REWEIGHT PRI-AFF 
-1       0.17578 root default                           
-3       0.08789     host vms81                         
 0   hdd 0.02930         osd.0      up  1.00000 1.00000 
 1   hdd 0.02930         osd.1      up  1.00000 1.00000 
 2   hdd 0.02930         osd.2      up  1.00000 1.00000 
-5             0     host vms82                         
-7       0.08789     host vms83                         
 6   hdd 0.02930         osd.6      up  1.00000 1.00000 
 7   hdd 0.02930         osd.7      up  1.00000 1.00000 
 8   hdd 0.02930         osd.8      up  1.00000 1.00000 
 3             0 osd.3            down        0 1.00000 
 4             0 osd.4            down        0 1.00000 
 5             0 osd.5            down        0 1.00000 
```

### 关闭被删除节点上的服务

```bash
systemctl stop ceph-osd.target
systemctl stop ceph-osd@vms82
```

### 部署节点上删除用户

```bash
[root@vms81 ceph-install]# ceph auth del osd.5
updated
[root@vms81 ceph-install]# ceph auth del osd.4
updated
[root@vms81 ceph-install]# ceph auth del osd.3
updated
```

### 部署节点上从集群中删除节点

```bash
[root@vms81 ceph-install]# ceph osd rm osd.5
removed osd.5
[root@vms81 ceph-install]# ceph osd rm osd.4
removed osd.4
[root@vms81 ceph-install]# ceph osd rm osd.3
removed osd.3
[root@vms81 ceph-install]# ceph osd tree
ID CLASS WEIGHT  TYPE NAME      STATUS REWEIGHT PRI-AFF 
-1       0.17578 root default                           
-3       0.08789     host vms81                         
 0   hdd 0.02930         osd.0      up  1.00000 1.00000 
 1   hdd 0.02930         osd.1      up  1.00000 1.00000 
 2   hdd 0.02930         osd.2      up  1.00000 1.00000 
-5             0     host vms82                         
-7       0.08789     host vms83                         
 6   hdd 0.02930         osd.6      up  1.00000 1.00000 
 7   hdd 0.02930         osd.7      up  1.00000 1.00000 
 8   hdd 0.02930         osd.8      up  1.00000 1.00000 
```

### 删除mon并剔除主机

```bash
[root@vms81 ceph-install]# ceph mon remove vms82
removing mon.vms82 at 192.168.26.82:6789/0, there will be 2 monitors
[root@vms81 ceph-install]# ceph mon stat
e3: 2 mons at {vms81=192.168.26.81:6789/0,vms83=192.168.26.83:6789/0}, election epoch 10, leader 0 vms81, quorum 0,1 vms81,vms83
[root@vms81 ceph-install]# ceph osd crush remove vms82
removed item id -5 name 'vms82' from crush map
```

### 还原节点磁盘

删除lvm和vg

```bash
[root@vms82 ~]# lvs
  LV                                             VG                                        Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  osd-block-a0a184d5-806f-4212-9254-07a142cf395d ceph-4ae06105-cf59-4096-95b9-3c170b46f005 -wi-a----- <30.00g                                                    
  osd-block-497ba26e-a483-4ed8-9c08-6193d29e022c ceph-50b5c8ef-0d21-424c-b3f7-687fb8bb79bc -wi-a----- <30.00g                                                    
  osd-block-8bca27db-2de5-4851-9923-16e267110257 ceph-58416bbc-9803-4674-aba4-170f1fd7a3f6 -wi-a----- <30.00g                                                    
[root@vms82 ~]# lvremove /dev/ceph-4ae06105-cf59-4096-95b9-3c170b46f005/osd-block-a0a184d5-806f-4212-9254-07a142cf395d 
Do you really want to remove active logical volume ceph-4ae06105-cf59-4096-95b9-3c170b46f005/osd-block-a0a184d5-806f-4212-9254-07a142cf395d? [y/n]: y
  Logical volume "osd-block-a0a184d5-806f-4212-9254-07a142cf395d" successfully removed
[root@vms82 ~]# lvremove /dev/ceph-50b5c8ef-0d21-424c-b3f7-687fb8bb79bc/osd-block-497ba26e-a483-4ed8-9c08-6193d29e022c 
Do you really want to remove active logical volume ceph-50b5c8ef-0d21-424c-b3f7-687fb8bb79bc/osd-block-497ba26e-a483-4ed8-9c08-6193d29e022c? [y/n]: y
  Logical volume "osd-block-497ba26e-a483-4ed8-9c08-6193d29e022c" successfully removed
[root@vms82 ~]# lvremove /dev/ceph-58416bbc-9803-4674-aba4-170f1fd7a3f6/osd-block-8bca27db-2de5-4851-9923-16e267110257 
Do you really want to remove active logical volume ceph-58416bbc-9803-4674-aba4-170f1fd7a3f6/osd-block-8bca27db-2de5-4851-9923-16e267110257? [y/n]: y
  Logical volume "osd-block-8bca27db-2de5-4851-9923-16e267110257" successfully removed
[root@vms82 ~]# vgs
  VG                                        #PV #LV #SN Attr   VSize   VFree  
  ceph-4ae06105-cf59-4096-95b9-3c170b46f005   1   0   0 wz--n- <30.00g <30.00g
  ceph-50b5c8ef-0d21-424c-b3f7-687fb8bb79bc   1   0   0 wz--n- <30.00g <30.00g
  ceph-58416bbc-9803-4674-aba4-170f1fd7a3f6   1   0   0 wz--n- <30.00g <30.00g
[root@vms82 ~]# vgremove ceph-4ae06105-cf59-4096-95b9-3c170b46f005 
  Volume group "ceph-4ae06105-cf59-4096-95b9-3c170b46f005" successfully removed
[root@vms82 ~]# vgremove ceph-58416bbc-9803-4674-aba4-170f1fd7a3f6 
  Volume group "ceph-58416bbc-9803-4674-aba4-170f1fd7a3f6" successfully removed
[root@vms82 ~]# vgremove ceph-50b5c8ef-0d21-424c-b3f7-687fb8bb79bc 
  Volume group "ceph-50b5c8ef-0d21-424c-b3f7-687fb8bb79bc" successfully removed
```

## 参数设置

`nearfull_ratio <= backfillfull_ratio <= full_ratio`

* mon_osd_nearfull_ratio 

告警水位，集群中的任一 OSD 空间使用率大于等于此数值时，集群将被标记为 NearFull，此时集群将产生告警，并提示所有已经处于 NearFull 状态的 OSD

默认值：0.85

* mon_osd_backfillfull_ratio OSD 

空间使用率大于等于此数值时，拒绝 PG 通过 Backfill 方式迁出或者继续迁入本 OSD

默认值：0.90

* mon_osd_full_ratio 

报停水位，集群任意一个 OSD 使用率大于等于此数值时，集群将被标记为 full，此时集群停止接受客户端的写入请求

默认值：0.95

```bash
#查看健康状态
ceph health detial
#设置 full_ratio 需要小于等于 osd_failsafe_full_ratio
#nearfull_ratio <= backfillfull_ratio <= full_ratio
ceph osd set-nearfull-ratio 0.8
#查看值
[root@vms81 ceph-install]# ceph osd dump |grep full
full_ratio 0.85
backfillfull_ratio 0.9
nearfull_ratio 0.8
#查看默认参数配置
[root@vms81 ceph-install]# ceph --show-config | grep full_ratio
mon_osd_backfillfull_ratio = 0.900000
mon_osd_full_ratio = 0.850000
mon_osd_nearfull_ratio = 0.850000
osd_failsafe_full_ratio = 0.970000
osd_pool_default_cache_target_full_ratio = 0.800000
#修改完后推送到所有节点
ceph-deploy --overwrite-conf config push vms81 vms83
```

