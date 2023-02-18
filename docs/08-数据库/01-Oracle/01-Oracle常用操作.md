
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