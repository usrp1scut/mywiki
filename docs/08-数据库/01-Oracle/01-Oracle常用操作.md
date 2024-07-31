
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

## 更新数据

```sql
update tablename set column_name = 'value' where column_name = 'value';
```

## 清空用户下所有对象

```sql
begin
for s in (select 'drop '||object_type||' '||object_name|| case when object_type='TABLE' then ' cascade constraints' else ' ' end drop_object
from user_objects a
where object_type in ('SEQUENCE','PROCEDURE','FUNCTION','PACKAGE','VIEW','TABLE') 
) loop
execute immediate s.drop_object;
end loop;
end;
/
```

## 查询用户历史命令 

```sql
select 
    SQL_TEXT,LAST_ACTIVE_TIME 
from 
    v$sqlarea t 
  where t.PARSING_SCHEMA_NAME 
  in ('USERNAME大写') 
  order by t.LAST_ACTIVE_TIME;
```

## oracle账号密码过期
oracle账号密码过期处理步骤如下：
### 1.查看用户的资源计划是哪个
```sql
SELECT username,PROFILE FROM dba_users where username=‘用户名’
```
### 2.查看密码过期时间
```sql
select username,expiry_date,profile from dba_users ;
```
或查看I密码有效期
```sql
SELECT * FROM dba_profiles s WHERE s.profile='DEFAULT' AND resource_name='PASSWORD_LIFE_TIME';
```
### 3.设置密码永不过期

由于用户使用的资源计划是default，所以修改default的就行
```sql
alter profile default limit password_life_time unlimited; --永久期限
```
### 4.修改完后解锁用户或者修改密码
```sql
alter user username identified by "password";
alter user username account unlock;
```
### 修改密码可能报错密码复杂度的问题

同样先查看用户使用的那个资源计划，然后根据资源计划名查询resource_name，密码复杂度的为PASSWORD_VERIFY_FUNCTION

```sql
select profile,resource_name,resource_type,limit from dba_profiles where profile='DEFAULT';
```

然后将密码负责度resource设置为null

```sql
alter profile default limit password_verify_function null;
```
重置密码

完成后如有需要在将密码复杂度的resource设置回原来的默认设置

## 查看Oracle数据库中所有表的无效索引

```sql
SELECT owner, table_name, index_name, status
FROM all_indexes
WHERE status = 'INVALID'
ORDER BY owner, table_name;
```

该语句将返回所有拥有无效索引的表的所有者、表名、索引名和状态。您还可以根据需要添加其他条件（例如，指定特定的表空间或索引类型）。