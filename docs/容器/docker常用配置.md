### 1. 配置容器内网络代理

`vi ~/.docker/config.json `

```
{
 "proxies":
 {
   "default":
   {
     "httpProxy": "http://192.168.1.2:7890",
     "httpsProxy": "http://192.168.1.2:7890",
     "noProxy": "localhost,127.0.0.1,.example.com"
   }
 }
}
```

### 2.docker 镜像加速器

`cat /etc/docker/daemon.json `

```
{
  "registry-mirrors": ["https://og45rd7t.mirror.aliyuncs.com"]
}
```