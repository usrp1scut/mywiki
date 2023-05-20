
11g中oracle提供了一个ADRCI的命令行工具来查看ADR中的alert日志和trace信息，可以批量删除对应的日志文件。

adrci的位置在$ORACLE_HOME/bin目录下

## 1.登陆  oracle用户下

```bash
su - oracle
. prof_testdb
adrci
```

## 2.查看目录
```
show home

```
此时输出可能会有好几个路径

## 3.指定要删除的路径

```
set homepath diag/rdbms/test/test
show home
```

## 4.查看incident
```
show incident
```

## 5.删除30天前的incident 43200=60min*24*30

```
purge -age 43200 -type incident
```
## 6.purge其他用法
```
help purge
```