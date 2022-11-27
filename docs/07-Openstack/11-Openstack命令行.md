## 命令行登录

管理节点上有keystonerc_admin文件

```bash
[root@vms71 ~]# cat keystonerc_admin 
unset OS_SERVICE_TOKEN
    export OS_USERNAME=admin
    export OS_PASSWORD='admin'
    export OS_REGION_NAME=RegionOne
    export OS_AUTH_URL=http://192.168.26.71:5000/v3
    export PS1='[\u@\h \W(keystone_admin)]\$ '
    
export OS_PROJECT_NAME=admin
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_DOMAIN_NAME=Default
export OS_IDENTITY_API_VERSION=3
```

应用环境变量

```bash
source keystonerc_admin 
```

测试

```bash
openstack service list
```

## 命令行语法

### 1.查看对象

`openstack 对象类型 list`

```bash
openstack user list
openstack role list
openstack project list
openstack image list
openstack volume list
openstack server list
```

### 2.查看对象属性

`openstack 对象类型 show 名字`

```bash
openstack user show tom
openstack volume show d1
openstack image show cirrors
```

### 3.创建对象

`openstack 对象类型 create --选项1 --选项2 ... 名字`

创建的资源类型不同，选项不一样，

通过`openstack 对象类型 create --help | head -n 15`查询

```bash
[root@vms71 ~(keystone_admin)]# openstack user create --help | head -15
usage: openstack user create [-h] [-f {json,shell,table,value,yaml}]
                             [-c COLUMN] [--max-width <integer>] [--fit-width]
                             [--print-empty] [--noindent] [--prefix PREFIX]
                             [--domain <domain>] [--project <project>]
                             [--project-domain <project-domain>]
                             [--password <password>] [--password-prompt]
                             [--email <email-address>]
                             [--description <description>]
                             [--enable | --disable] [--or-show]
                             <name>

Create new user

positional arguments:
  <name>                New user name
[root@vms71 ~(keystone_admin)]# openstack user create --password redhat --enable bob
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
| enabled             | True                             |
| id                  | d0daee6abdd043e49e4ae80cb0bd5456 |
| name                | bob                              |
| options             | {}                               |
| password_expires_at | None                             |
+---------------------+----------------------------------+
```

### 4.设置对象属性

`openstack 对象类型 set --选项1 --选项2 ... 名字`

创建的资源类型不同，选项不一样，

通过`openstack 对象类型 set --help | head -n 15`查询

## 项目管理

### 项目的用户角色操作

```bash
#授予bob在p2项目中的admin角色
openstack role add --project p2 --user bob admin
#移除角色授权
openstack role remove --project p2 --user bob admin
```

## 多域管理

每个域的用户和资源完全逻辑独立

### dashboard开启多域支持

开启后dashboard登录界面才有输入域的选项

```bash
[root@vms71 ~(keystone_admin)]# vi /etc/openstack-dashboard/local_settings 

#更改以下选项
#开启多域支持
OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT = True


#设置默认域
OPENSTACK_KEYSTONE_DEFAULT_DOMAIN = 'Default'

[root@vms71 ~(keystone_admin)]# systemctl restart httpd
```

### 创建域

```bash
openstack domain create domain1
```

### 查看域

```bash
openstack domain list
```

### 删除域
```bash
openstack domain set --disable domain1
openstack domain delete domain1
```
### 为域创建用户

```bash
openstack user create --email user1@aa.com --password password --domain domain1
```
### 查看指定域的对象

查看用户
```bash
[root@vms71 ~(keystone_admin)]# openstack user list --domain domain1
+----------------------------------+-------+
| ID                               | Name  |
+----------------------------------+-------+
| 815153ae546c48f4bf525126c5aeb2cd | user1 |
+----------------------------------+-------+
```

查看项目
```bash
[root@vms71 ~(keystone_admin)]# openstack project list --domain domain1
+----------------------------------+------+
| ID                               | Name |
+----------------------------------+------+
| 5edb69f4845245dcb7d8be64a10fd7ba | p1   |
+----------------------------------+------+
```

### 为指定域的项目绑定授权角色

`role add`无法同时支持--project和--domain选项，可以使用查询到的user id及project id 进行绑定

```bash
openstack role add --user 815153ae546c48f4bf525126c5aeb2cd --project 5edb69f4845245dcb7d8be64a10fd7ba admin
```

