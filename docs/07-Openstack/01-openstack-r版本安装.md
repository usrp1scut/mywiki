# centos7 packstack安装openstack rocky

## 实验环境

* 控制节点：192.168.26.71 4c8g Centos7 200G硬盘

* 计算节点：192.168.26.72 4c8g Centos7 200G硬盘

## 初始化（所有节点）

### 添加hosts

```bash
vi /etc/hosts
```

```
#添加
192.168.26.71  vms71
192.168.26.72  vms72
```

### 关闭防火墙和SELinux
```bash
firewall-cmd --set-default-zone=trusted
sed -i '/SELINUX=/cSELINUX=disabled' /etc/sysconfig/selinux
setenforce 0
```

### 禁用NetworkManager
```bash
systemctl stop NetworkManager
systemctl disable NetworkManager
```

### 添加阿里源

```bash
yum install wget
wget https://xiebo.pro/tools/openstack/ali.repo -P /etc/yum.repos.d/
yum clean all
```

### 手动上传安装缺少的依赖

[https://xiebo-pro/tools/openstack/python2-pyngus-2.3.0-1.el7.noarch.rpm](https://xiebo-pro/tools/openstack/python2-pyngus-2.3.0-1.el7.noarch.rpm)

[https://xiebo-pro/tools/openstack/python2-qpid-proton-0.31.0-3.el7.x86_64.rpm](https://xiebo-pro/tools/openstack/python2-qpid-proton-0.31.0-3.el7.x86_64.rpm)

[https://xiebo-pro/tools/openstack/qpid-proton-c-0.31.0-3.el7.x86_64.rpm](https://xiebo-pro/tools/openstack/qpid-proton-c-0.31.0-3.el7.x86_64.rpm)

将以上三个包上传，进入到上传目录
```bash
yum install * -y
```
### 降低leatherman版本
```bash
yum remove leatherman-1.10.0-1.el7.x86_64
yum install leatherman-1.3.0-9.el7.x86_64
```
## 安装packstack及openstack(控制节点操作)

### 安装packstack
```bash
yum install openstack-packstack
#openstack工具包utils(可选)
yum install openstack-utils
```

### 生成模板配置文件
```bash
packstack --gen-answer-file=aa.txt
```

### 修改配置
```bash
sed -i '/^CONFIG_PROVISION_DEMO=/cCONFIG_PROVISION_DEMO=n' aa.txt
#网络设置
sed -i '/^CONFIG_NEUTRON_ML2_TYPE_DRIVERS=/cCONFIG_NEUTRON_ML2_TYPE_DRIVERS=flat, vxlan' aa.txt
sed -i '/^CONFIG_NEUTRON_ML2_FLAT_NETWORKS=/cCONFIG_NEUTRON_ML2_FLAT_NETWORKS=datacentre' aa.txt
sed -i '/^CONFIG_NEUTRON_OVS_BRIDGE_MAPPINGS=/cCONFIG_NEUTRON_OVS_BRIDGE_MAPPINGS=datacentre:br-ex' aa.txt
#管理员密码
sed -i.bak -r 's/(.+_PW)=[0-9a-z]+/\1=password/g' aa.txt
```
### 安装openstack
```bash
packstack --answer-file=aa.txt
```

### 安装完成打开dashboard

[http://192.168.26.71/dashboard](http://192.168.26.71/dashboard)

账号admin 密码为配置文件中设置，如未设置可查看/root/keystonerc_admin获得初始密码

```bash
[root@vms71 ~]# cat keystonerc_admin 
unset OS_SERVICE_TOKEN
    export OS_USERNAME=admin
    export OS_PASSWORD='password'
    export OS_REGION_NAME=RegionOne
    export OS_AUTH_URL=http://192.168.26.71:5000/v3
    export PS1='[\u@\h \W(keystone_admin)]\$ '
    
export OS_PROJECT_NAME=admin
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_DOMAIN_NAME=Default
export OS_IDENTITY_API_VERSION=3
```

### 创建桥接网桥

创建ifcfg-br-ex，修改ifcfg-ens32
```bash
[root@vms71 ~]# cat /etc/sysconfig/network-scripts/ifcfg-br-ex
DEVICE=br-ex
DEVICETYPE=ovs
TYPE=OVSBridge
BOOTPROTO=none
IPADDR=192.168.26.71
NETMASK=255.255.255.0
GATEWAY=192.168.26.2
DNS1=192.168.26.2
ONBOOT=yes
[root@vms71 ~]# cat /etc/sysconfig/network-scripts/ifcfg-ens32 
DEVICE=ens32
DEVICETYPE=ovs
TYPE=OVSPort
ONBOOT=yes
BOOTPROTO=none
OVS_BRIDGE=br-ex
[root@vms71 ~]# systemctl restart network
```