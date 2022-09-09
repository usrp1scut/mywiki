### 1. 安装

centos:`yum install -y dnsmasq`

ubuntu:`sudo apt install dnsmasq`

### 2.配置dnsmasq.conf

`vi /etc/dnsmasq.conf`

```bash
#缓存过期时间，单位为秒
local-ttl=3600
#缓存记录的条数
cache-size=1000000
#并发数
dns-forward-max=100000
#监听地址
listen-address=127.0.0.1,192.168.0.2
#指定上游DNS服务器配置文件，也可以直接使用resolv.conf
resolv-file=/etc/resolv.dnsmasq.conf
#同时向所有上游DNS查询结果并返回响应最快的
all-servers
#开启日志
log-queries
#日志记录路径
log-facility=/var/log/dnsmasq/dnsmasq.log
log-async=100
#其他配置文件路径
conf-dir=/etc/dnsmasq.d
#不使用/etc/hosts的配置，默认使用，私有域数量少的情况下可直接修改hosts文件改解析，数量多的情况下按域名区分配置文件便于管理
#no-hosts
```

### 3.配置域名解析

`vi /etc/dnsmasq.d/local.conf`

```bash
address=/k8s-node1/192.168.1.41
address=/k8s-node2/192.168.1.42
address=/k8s-node3/192.168.1.43
```
### 4.配置上游DNS解析规则

* [别人整理的规则](https://github.com/felixonmars/dnsmasq-china-list)

`vi /etc/dnsmasq.d/server.conf`

```
#因为dnsmasq是顺序匹配，所以不建议配置过多解析规则
server=/cn/114.114.114.114
server=/aliyun.com/223.5.5.5
server=/google.com/8.8.8.8
server=/apple.com/168.95.1.1
server=/qq.com/119.29.29.29
server=/taobao.com/223.5.5.5
server=/tencent-cloud.net/119.29.29.29
server=/tencent.com/119.29.29.29
server=/tencent-cloud.com/119.29.29.29
server=/tencentmusic.com/119.29.29.29
```
### 5.启动服务

```
systemctl enable dnsmasq --now
```