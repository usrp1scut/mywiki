
### 查看池

```bash
ceph osd pool ls
```
### 创建池

语法

```bash
#pg数应等于pgp数
ceph osd pool create 池名 pg数 pgp数
ceph osd pool create 池名 pg数
```

### 查看池属性

```bash
ceph osd pool ls detail
#查看pool所有参数
[root@vms81 ceph-install]# ceph osd pool get pool1 all
size: 1
min_size: 1
crash_replay_interval: 0
pg_num: 320
pgp_num: 320
crush_rule: replicated_rule
hashpspool: true
nodelete: false
nopgchange: false
nosizechange: false
write_fadvise_dontneed: false
noscrub: false
nodeep-scrub: false
use_gmt_hitset: 1
auid: 0
fast_read: 0
#查看指定某个属性
ceph osd pool get 池名 属性
#查看副本数
ceph osd pool get pool1 size
```

### 设置池属性

设置某个属性，语法如下：

`ceph osd pool set 池名 参数名 参数的值`

```bash
[root@vms81 ceph-install]# ceph osd pool set pool1 size 3
set pool 2 size to 3
```

设置多个副本的话，这些副本会分布到不同主机的OSD 上

### 删除池

删除池的语法是：
```bash
rados rmpool 池名 池名 --yes-i-really-really-mean-it
```

默认不允许我们删除 pool，修改参数才能删除池

在部署目录 ceph.conf 里添加：
```conf
[mon]
mon allow pool delete = true
```

然后分发到所有的节点：

```bash
ceph-deploy --overwrite-conf config push vms81 vms82
```

在所有节点上重启
```bash
systemctl restart ceph-mon.target
```

再次删除池：
```bash
[root@vms81 ceph-install]# rados rmpool pool1 pool1 --yes-i-really-really-mean-it
successfully deleted pool pool1
```
### pg数量计算

每个osd的pg数量控制在50-100为最佳，建议不少于30个

每个osd最大pg数默认为250，查看方法：

```bash
ceph --show-config|grep mon_max_pg_per_osd
```

集群pg总数=100*osd数

每个池pg数=总数/池数/副本数

得出的数量最好就近取2的次幂2^n

### 在线扩池pg数

```bash
[root@vms81 ceph-install]# ceph osd pool set pool1 pg_num 288
2022-11-02 20:56:42.581817 7fa2ec83e700  0 -- 192.168.26.81:0/4239381603 >> 192.168.26.81:6812/14427 conn(0x7fa2d0008d80 :-1 s=STATE_CONNECTING_WAIT_CONNECT_REPLY_AUTH pgs=0 cs=0 l=1).handle_connect_reply connect got BADAUTHORIZER
set pool 2 pg_num to 288
[root@vms81 ceph-install]# ceph osd pool set pool1 pgp_num 288
2022-11-02 20:56:46.914607 7fd6eb7fe700  0 -- 192.168.26.81:0/1821565654 >> 192.168.26.81:6812/14427 conn(0x7fd6d8008d80 :-1 s=STATE_CONNECTING_WAIT_CONNECT_REPLY_AUTH pgs=0 cs=0 l=1).handle_connect_reply connect got BADAUTHORIZER
set pool 2 pgp_num to 288
```

pg要等于pgp

一次性不允许增加的pg数量超过 `mon_osd_max_split_count`

```bash
ceph --show-config | grep mon_osd_max_split_count
```

### 查看pg在osd上的分布

获取每个osd的pg数
```bash
ceph osd df tree | awk '/osd\./{print $NF":"$(NF-1)}'

for i in `ceph osd ls`;do echo -n "osd.$i:";ceph pg ls-by-osd $i | grep -v '^pg_stat' | wc -l;done
```


显示所有 pg 的分配情况，第 17 列显示的是某个 pg 所在的 osd。
```bash
ceph pg dump 
```

### 模拟写数据

rados bench 的用法：
```
rados bench -p <pool_name> <seconds> <write|seq|rand> -b <block size> -t --no-cleanup
```

* `<pool_name>`：池名称
* `<seconds>`：测试所持续的秒数
* `<write|seq|rand>`：操作模式，
  * write：写，
  * seq：顺序读；
  * rand：随机读

* -b：块大小，即一次写入的数据量大小,默认为 4MB

* -t：线程数量,默认为 16

* --no-cleanup 表示测试完成后不删除测试用数据。在做读测试之前，需要使用该参数来运行一遍写测试来产生测试数据，在全部测试结束后可以运行 `rados -p <pool_name> cleanup` 来清理所有测试数据。默认是会被清空

例子：
```
rados bench 3000 -b 4M -t 16 write --no-cleanup -p pool1
```
在全部测试结束后可以运行 `rados -p <pool_name> cleanup` 来清理所有测试数据。默认是会被清空

查看osd用量
```
ceph osd df
```

### 调整osd优先级

通过调整优先级让某个osd先写

osd权重取0-1之间
```
[root@vms81 ceph-install]# ceph osd df
ID CLASS WEIGHT  REWEIGHT SIZE    USE     DATA    OMAP META AVAIL   %USE  VAR  PGS 
 0   hdd 0.02930  1.00000 30.0GiB 6.88GiB 5.88GiB   0B 1GiB 23.1GiB 22.94 1.17 114 
 1   hdd 0.02930  1.00000 30.0GiB 7.05GiB 6.05GiB   0B 1GiB 23.0GiB 23.49 1.20 111 
 2   hdd 0.02930  1.00000 30.0GiB 5.83GiB 4.83GiB   0B 1GiB 24.2GiB 19.45 0.99  83 
 6   hdd 0.02930  1.00000 30.0GiB 4.99GiB 3.99GiB   0B 1GiB 25.0GiB 16.65 0.85  91 
 7   hdd 0.02930  1.00000 30.0GiB 4.91GiB 3.91GiB   0B 1GiB 25.1GiB 16.38 0.83  88 
 8   hdd 0.02930  1.00000 30.0GiB 5.67GiB 4.67GiB   0B 1GiB 24.3GiB 18.92 0.96  89 
                    TOTAL  180GiB 35.3GiB 29.3GiB   0B 6GiB  145GiB 19.64          
MIN/MAX VAR: 0.83/1.20  STDDEV: 2.76
```

降低osd.6优先级
```bash
ceph osd crush reweight osd.6 0.01930
```
再次模拟写入
```bash
rados bench -p pool1 480 write --no-cleanup
```

查看结果，osd.6写入减少
```
[root@vms81 ceph-install]# ceph osd df
ID CLASS WEIGHT  REWEIGHT SIZE    USE     DATA    OMAP META AVAIL   %USE  VAR  PGS 
 0   hdd 0.02930  1.00000 30.0GiB 10.8GiB 9.75GiB   0B 1GiB 19.2GiB 35.85 1.18 117 
 1   hdd 0.02930  1.00000 30.0GiB 11.5GiB 10.5GiB   0B 1GiB 18.5GiB 38.18 1.25 117 
 2   hdd 0.02930  1.00000 30.0GiB 9.37GiB 8.37GiB   0B 1GiB 20.6GiB 31.22 1.02  85 
 6   hdd 0.01929  1.00000 30.0GiB 5.87GiB 4.87GiB   0B 1GiB 24.1GiB 19.58 0.64  70 
 7   hdd 0.02930  1.00000 30.0GiB 7.95GiB 6.95GiB   0B 1GiB 22.0GiB 26.51 0.87  96 
 8   hdd 0.02930  1.00000 30.0GiB 9.46GiB 8.46GiB   0B 1GiB 20.5GiB 31.52 1.03  91 
                    TOTAL  180GiB 54.9GiB 48.9GiB   0B 6GiB  125GiB 30.48  
```

### 池命名空间管理

可以通过命名空间对池里的对象进行隔离

不需要单独创建命名空间，只需要在上传对象的时候指定一个命名空间

```bash
#上传
rados -p pool1 -N ns1 put xx /etc/hosts
#查看
rados -p pool1 -N ns1 ls
#删除
rados rm -p pool1 -N ns1 xx
``` 

### 设置应用属性

查看应用属性
```bash
ceph osd pool application get pool1
```
设置的语法

`ceph osd pool application enable 池名 类型`

意思是把这个池的应用类型设置为指定的类型，可选的类型为:
* rbd
* cephfs
* rgw

```bash
#未设置应用类型
[root@vms81 ceph-install]# ceph osd pool application get pool1
{}
#设置pool1应用类型为rbd
[root@vms81 ceph-install]# ceph osd pool application enable pool1 rbd
enabled application 'rbd' on pool 'pool1'
#查看应用类型为rbd
[root@vms81 ceph-install]# ceph osd pool application get pool1
{
    "rbd": {}
}
#取消应用类型
[root@vms81 ceph-install]# ceph osd pool application disable pool1 rbd --yes-i-really-mean-it
disable application 'rbd' on pool 'pool1'
[root@vms81 ceph-install]# ceph osd pool application get pool1
{}
```

建议根据自己的需要，我创建某个池到底是要干嘛的，从而来设置这个池的应用类型。