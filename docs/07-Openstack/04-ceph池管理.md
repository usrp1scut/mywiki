## 查看池

```bash
ceph osd pool ls
```
## 池操作

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
ceph osd pool get pool1 all
```

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

在节点上重启
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