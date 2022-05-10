###  需求
公网弹性IP云服务器*1  运行frps

内网服务器*1         运行frpc

操作系统基于Centos 7

[下载frp](https://github.com/fatedier/frp/releases)server与client均包含在内
#### frp下载(服务端与客户端)

1. 下载并解压缩
[下载frp](https://github.com/fatedier/frp/releases)server与client为同一包

 `tar zxvf frp_0.37.1_linux_amd64.tar.gz `

2. 更改目录名并进入目录

` mv frp_0.37.1_linux_amd64 frp/ `
` cd frp `

#### 服务端frps.ini配置
```
 [common] 

 bind_port = 7310     #frps服务端口 

 log_file = ./frps.log 

 log_level = info 

 token = *******     #验证密码 

 disable_log_color = false 

 max_pool_count = 100 

 log_max_days = 3 
```
#### 客户端frpc.ini配置
```
 [common] 

 server_addr = 120.20.00.00    #frps公网IP 


 server_port = 7310 
 token = *******    #验证密码 

#例：穿透openvpn服务
 [openvpn] 

 type = tcp 

 local_ip = 127.0.0.1    #需穿透主机IP   

 local_port = 1194       #需穿透服务端口 

 remote_port = 37404     #映射到的服务端访问端口 

 use_encryption = true    

 use_compression = true   #加密和压缩 
 ```

####   将frp服务加入自启动

 `vim /lib/systemd/system/frpc.service`（客户端） 

 `vim /lib/systemd/system/frps.service`（服务端） 
```
 [Unit] 

 Description=frps/frpc service 

 After=network.target syslog.target 

 Wants=network.target 

 [Service] 

 Type=simple 

 #启动服务的命令（此处写你的frp的实际安装目录） 

 ExecStart=/root/frp/（frps或frpc） -c /root/frp/（frps或frpc）.ini 

 [Install] 

 WantedBy=multi-user.target 
```
编辑后就可以通过systemctl操作frp服务了