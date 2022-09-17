## 1.概念

LVM（逻辑卷管理）中的几个概念：


PV(physical volume)：物理卷在逻辑卷管理系统最底层，可为整个物理硬盘或实际物理硬盘上的分区。

VG(volume group)：卷组建立在物理卷上，一卷组中至少要包括一物理卷，卷组建立后可动态的添加卷到卷组中，一个逻辑卷管理系统工程中可有多个卷组。

LV(logical volume)：逻辑卷建立在卷组基础上，卷组中未分配空间可用于建立新的逻辑卷，逻辑卷建立后可以动态扩展和缩小空间。

PE(physical extent)：物理区域是物理卷中可用于分配的最小存储单元，物理区域大小在建立卷组时指定，一旦确定不能更改，同一卷组所有物理卷的物理区域大小需一致，新的pv加入到vg后，pe的大小自动更改为vg中定义的pe大小。

LE(logical extent)：逻辑区域是逻辑卷中可用于分配的最小存储单元，逻辑区域的大小取决于逻辑卷所在卷组中的物理区域的大小。

卷组描述区域：卷组描述区域存在于每个物理卷中，用于描述物理卷本身、物理卷所属卷组、卷组中逻辑卷、逻辑卷中物理区域的分配等所有信息，它是在使用pvcreate建立物理卷时建立的。

## 2.配置步骤

### 2.1.添加物理磁盘

添加用于 LVM 的物理存储器。这些通常是标准分区，但也可以是已创建的 Linux Software RAID 卷。利用fdisk命令，将sdb、sdc等磁盘进行分区创建为sdb1、sdc1等， 通过fdisk的t指令指定分区为8e类型(Linux LVM) 。

### 2.2.创建物理卷PV

```bash
#创建物理卷
pvcreate /dev/sdb1 /dev/sdc1
#显示物理卷
pvdisplay
```

### 2.3.创建卷组

```bash
vgcreate myvg /dev/sdb1 /dev/sdc1
```

### 2.4.卷组增加pv

```bash
vgextend myvg /dev/sdb2
```

### 2.5.创建逻辑卷

```bash
lvcreate -L 1500 -ntestlv myvg /dev/sdg1
```

### 2.6.扩展逻辑卷

```bash
lvextend -L +100M /dev/vg1000/lvol0
```
