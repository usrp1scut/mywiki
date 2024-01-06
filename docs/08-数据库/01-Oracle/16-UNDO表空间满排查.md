[原文链接~~~~](https://www.cnblogs.com/nathon-wang/p/10293919.html)

### 1、查看数据库当前实例使用的是哪个UNDO表空间：
```sql
show parameter undo_tablespace
```
### 2、查看UNDO表空间对应的数据文件和大小
```sql
select tablespace_name,file_name,bytes/1024/1024 MB from dba_data_files
where tablespace_name like '%UNDOTBS%';
```
### 3、查看undo表空间属性：
```sql
show parameter undo
```

```sql
select retention,tablespace_name from dba_tablespaces where tablespace_name like '%UNDOTBS%';
```

* undo段中区的状态：
  * free：     区未分配给任何一个段
  * active：  已经被分配给段，并且这个段被事务所使用，且事务没有提交，不能覆盖。 （区被未提交的事务使用）       
  * unexpired：事务已经提交，但是区还在段中，还没有被覆盖且未达到undo_retention设定的时间。（nogurantee的情况下，原则上oracle尽量的不覆盖unexpired的区，但是如果undo空间压力及较大，oracle也会去覆盖。如果是guarantee，oracle强制保留retention时间内的内容，这时候free和expired空间不足的话，新事物将失败。）
  * expired：oracle希望已经提交的事务对应的undo表空间中的undo段中的区再保留一段时间。保留的时间就是undo_retention。

unexpired的区存在时间超过undo_retention设定的时间，状态就会变为expired。过期后的区就可以被覆盖了。原则上expired的区一般不会释放成free
:::warning
PS：生产中没有人会将UNDOTBS的retention设置成GUARANTEE这是很危险的。
:::

### 4、查看undo表空间当前的使用情况：
```sql
select tablespace_name,status,sum(bytes)/1024/1024 MB from dba_undo_extents
group by tablespace_name,status;
```

与一般的用户表空间不同，undo表空间不能通过dba_free_spaces来确定实际的使用情况，undo表空间除了active状态的extent不能被覆盖外。其他状态的extent都是可以空间复用的。

如果active的extent总大小很大，说明系统中存在大事务。如果undo资源耗尽（ACTIVE接近undotbs的总大小），可能导致事务失败。

### 5、查看什么事务占用了过多的undo：
```sql
select addr,used_ublk,used_urec,inst_id from gv$transaction order by 2 desc;
```

* 字段含义
  * ADDR: 事务的内存你地址。
  * USED_UBLK：事务使用的undo block数量。
  * USED_UREC：事务使用的undo record （undo前镜像的条数，例如：delete删除的记录数）

### 6、用上一步查到的ADDR查看占用undo的事务执行了什么sql：
```sql
select sql_id,last_call_et,program,machine from gv$session where taddr='<ADDR>';
```
* LAST_CALL_ET: 上一次调用到现在为止过了多长时间，单位为秒，途中显示过了304s (既可以理解为sql已经运行了304s)。
* SQL_ID: 查到执行的sql的id

查询具体的sql
```sql
select sql_text from v$sql where SQL_ID='<SQL_ID>';
```
### 7、找到了sql，下面就可以联系应用做处理了：

哪台机器，通过什么程序，发起了什么sql，占用了多少undo，是否可以杀掉，sql是否可以改写，是否可以分批提交。。。等

