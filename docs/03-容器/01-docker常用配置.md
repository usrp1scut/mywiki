### 1. 配置容器内网络代理

`vi ~/.docker/config.json `

```json
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
### 2. 配置镜像下载代理

```bash
mkdir /etc/systemd/system/docker.service.d

vi /etc/systemd/system/docker.serivce.d/http-proxy.conf
#配置代理信息
[Service]
Environment="HTTP_PROXY=http://192.168.1.2:7890/"
Environment="HTTPS_PROXY=http://192.168.1.2:7890/"

systemctl daemon-reload
systemctl restart docker
```

### 3.docker 镜像加速器

`cat /etc/docker/daemon.json `

```json
{
  "registry-mirrors": ["https://og45rd7t.mirror.aliyuncs.com"]
}
```