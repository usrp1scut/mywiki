# Docker 常用配置（代理与镜像加速）

## 1. 适用场景

- 在内网或受限网络环境中拉取镜像
- 容器内需要访问外网（如安装依赖、下载包）
- 提升镜像拉取速度

---

## 2. 前置条件

- 已安装 Docker
- 具备 root 或 sudo 权限
- 明确代理地址（如 `http://192.168.1.2:7890`）

---

## 3. 配置容器运行时代理（容器内网络代理）

编辑用户级 Docker 配置：

```bash
vi ~/.docker/config.json
```

示例：

```json
{
  "proxies": {
    "default": {
      "httpProxy": "http://192.168.1.2:7890",
      "httpsProxy": "http://192.168.1.2:7890",
      "noProxy": "localhost,127.0.0.1,.example.com"
    }
  }
}
```

> 说明：该配置主要影响 Docker 客户端启动的容器环境变量。

---

## 4. 配置 Docker Daemon 代理（镜像下载代理）

创建 systemd drop-in 目录：

```bash
mkdir -p /etc/systemd/system/docker.service.d
```

创建代理配置文件：

```bash
vi /etc/systemd/system/docker.service.d/http-proxy.conf
```

写入以下内容：

```ini
[Service]
Environment="HTTP_PROXY=http://192.168.1.2:7890/"
Environment="HTTPS_PROXY=http://192.168.1.2:7890/"
```

重载并重启：

```bash
systemctl daemon-reload
systemctl restart docker
```

---

## 5. 配置镜像加速器

编辑 daemon 配置：

```bash
vi /etc/docker/daemon.json
```

示例：

```json
{
  "registry-mirrors": ["https://og45rd7t.mirror.aliyuncs.com"]
}
```

重启生效：

```bash
systemctl restart docker
```

---

## 6. 验证配置

```bash
# 查看 Docker 服务环境变量（确认代理是否生效）
systemctl show --property=Environment docker

# 查看 daemon 当前配置
cat /etc/docker/daemon.json

# 试拉取镜像
docker pull nginx:latest
```

---

## 7. 回滚方案

```bash
# 删除 daemon 代理配置
rm -f /etc/systemd/system/docker.service.d/http-proxy.conf

# 删除镜像加速器配置（按需）
rm -f /etc/docker/daemon.json

systemctl daemon-reload
systemctl restart docker
```

---

## 8. 常见问题

### Q1：配置了代理仍然无法拉镜像？

- 检查代理地址是否可达
- 检查是否存在公司防火墙拦截
- 检查 `noProxy` 配置是否误伤目标地址

### Q2：`docker pull` 生效但容器内访问外网仍失败？

- 说明仅配置了 daemon 代理，未配置容器运行时代理
- 补充 `~/.docker/config.json` 或在 `docker run` 时显式传入 `-e HTTP_PROXY=...`
