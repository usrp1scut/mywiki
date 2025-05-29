### 查看ceph集群内用户

```bash
ceph auth list

···
#key的值是用户的密钥，caps开头是用户的权限
client.admin
        key: AQANeVZjpNHEBhAAzoneuMj2TxvzF63XTMBOjw==
        caps: [mds] allow *
        caps: [mgr] allow *
        caps: [mon] allow *
        caps: [osd] allow *
···
#用户名格式为  client.用户名
```

如果想单独查看某用户信息

```bash
ceph auth get client.admin
```

查看某用户的key

```bash
ceph auth get-key client.admin
```

### 创建和删除用户

创建用户可以使用add和get-or-create方法

```bash
[root@vms81 ~]# ceph auth add client.tom
added key for client.tom
[root@vms81 ~]# ceph auth get-or-create client.jerry
[client.jerry]
        key = AQBsn2tjAJh7IhAArKiFIboD8ik5UaqkYW4EAg==
[root@vms81 ~]# ceph auth get-or-create client.tom
#创建出来的用户没有任何权限caps
[client.tom]
        key = AQBSn2tjSyvMFBAArUfq2MqsZHuDF1oVxG/TOQ==

```

删除用户使用del

```bash
ceph auth del client.tom
```

包含授权的创建用户方法

`ceph auth add client.用户名 mon ‘allow rwx’ osd ‘allow rwx pool 池’ mds ‘..’`

 或

`ceph auth get-or-create client.用户名 mon ‘allow rwx’ osd ‘allow rwx pool 池’ mds ‘..’`

```bash
[root@vms81 ~]# ceph auth add client.tom mon 'allow rwx' osd 'allow rwx pool pool1,allow rwx pool pool2'
added key for client.tom
[root@vms81 ~]# ceph auth get client.tom
exported keyring for client.tom
[client.tom]
        key = AQBDoWtjgO28KhAA88DE8LDAisnfb3LFy88n/Q==
        caps mon = "allow rwx"
        caps osd = "allow rwx pool pool2"
```

### 导出用户keyring文件

```bash
#管理机导出用户keyring
 ceph auth get-or-create client.tom > /etc/ceph/ceph.client.tom.keyring
#拷贝keyring文件到客户机
 scp /etc/ceph/ceph.client.tom.keyring vms82:/etc/ceph/ceph.client.tom.keyring
#客户机查看文件
 ls /etc/ceph/
#验证用户权限
 rbd --user tom -p pool2 ls
```

### 修改用户权限

语法：`ceph auth caps client.用户名 mds "allow rw" osd "allow rw"`

<font color="red">通过 caps 修改用户权限的时候，并不是在原有权限的基础上进行添加或者删除，而是覆盖了原有的权限。用户要对池具备操作权限的话，一定要让此用户对 mon 具备相关的权限。</font>

```bash
[root@vms81 ~]# ceph auth caps client.tom osd "allow rwx pool pool2"
updated caps for client.tom

[root@vms82 ~]# rbd --user tom -p pool2 ls
2022-11-09 21:15:12.900916 7f6ea1441d40  0 librados: client.tom authentication error (13) Permission denied
rbd: couldn't connect to the cluster!
rbd: list: (13) Permission denied

```

```bash
[root@vms81 ~]# ceph auth caps client.tom osd "allow rwx pool pool2,allow rwx pool pool1" mon "allow rwx"
updated caps for client.tom



[root@vms82 ~]# rbd --user tom -p pool2 ls
[root@vms82 ~]# rbd --user tom -p pool1 ls
[root@vms82 ~]# 
```

