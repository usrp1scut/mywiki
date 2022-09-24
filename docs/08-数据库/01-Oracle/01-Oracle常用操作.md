
## 连接数据库
```sql
conn / as sysdba 
```
## 创建用户
```sql
create tablespace username    logging   datafile '/data/u02/oradata/username.dbf' size 500m autoextend on next  10m maxsize unlimited;

create user username identified by password  default tablespace username  temporary tablespace temp  profile default;

grant connect,resource to username;
--grant dba to username;
grant create any directory to username;
grant create database link to username;
grant debug connect session to username;
grant create table to username;
grant create view to username;
grant unlimited tablespace to username;
```

## 解锁用户
```sql
ALTER USER username ACCOUNT UNLOCK;
```


## 修改字符集
```sql
select userenv('language') from dual;
select * from nls_database_parameters;
SQL> SHUTDOWN IMMEDIATE
SQL> STARTUP MOUNT--startup mount exclusive
SQL> ALTER SYSTEM ENABLE RESTRICTED SESSION;
SQL> ALTER SYSTEM SET JOB_QUEUE_PROCESSES=0;
SQL> ALTER SYSTEM SET AQ_TM_PROCESSES=0;
SQL> ALTER DATABASE OPEN;
SQL> ALTER DATABASE CHARACTER SET INTERNAL_USE ZHS16GBK;
--   ALTER DATABASE NATIONAL CHARACTER SET INTERNAL_USE ALL16UTF16; 
SQL> SHUTDOWN IMMEDIATE
SQL> STARTUP
```