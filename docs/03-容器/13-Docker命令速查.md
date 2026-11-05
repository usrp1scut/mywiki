---
title: "Docker 命令速查"
description: "按镜像、容器、日志、网络和存储查询常用命令。代理和镜像加速配置见 [Docker 常用配置](./01-docker常用配置.md)，已有运行命令可用 [Docker 转 Compose 工具](/tools#docker)辅助整理。"
tags: [速查, 容器]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/docker-memo/docker.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

按镜像、容器、日志、网络和存储查询常用命令。代理和镜像加速配置见 [Docker 常用配置](./01-docker常用配置.md)，已有运行命令可用 [Docker 转 Compose 工具](/tools#docker)辅助整理。

## 环境与镜像

```bash
docker version
docker info
docker context ls
docker image ls
docker pull nginx:alpine
docker build -t myapp:dev .
docker image inspect myapp:dev
docker image history myapp:dev
docker image save -o myapp.tar myapp:dev
docker image load -i myapp.tar
```

镜像标签用于选择版本，但标签可以被重新指向；需要固定内容时使用 digest。切换 context 会改变命令所操作的 Docker 服务端，先确认再修改资源。

## 运行容器

```bash
docker run -d --name web \
  -p 127.0.0.1:8080:80 \
  --restart unless-stopped \
  nginx:alpine

docker run --rm -it \
  --mount type=bind,src="$PWD",dst=/work,readonly \
  -w /work alpine sh
```

| 参数 | 含义 |
| --- | --- |
| `-d` | 后台运行 |
| `-it` | 交互输入与伪终端 |
| `--rm` | 容器退出后删除容器 |
| `-p 主机地址:主机端口:容器端口` | 发布端口 |
| `-e KEY=value` / `--env-file 文件` | 注入环境变量 |
| `--mount` | 显式指定挂载类型与路径 |
| `--network` | 指定网络 |
| `--cpus` / `--memory` | 限制资源 |
| `--user` | 指定用户或 UID/GID |

`-p 8080:80` 默认会向主机所有接口发布，而示例只绑定回环地址。`EXPOSE` 仅声明镜像使用的端口，不负责发布。

## 状态与排查

```bash
docker ps -a
docker logs --tail 100 --timestamps web
docker logs -f --since 10m web
docker exec -it web sh
docker inspect web
docker stats --no-stream
docker top web
docker port web
docker cp web:/etc/nginx/nginx.conf ./nginx.conf
```

`exec` 需要容器正在运行，而且镜像里必须有对应程序；精简或 distroless 镜像不一定包含 shell。

## 网络与卷

```bash
docker network create app-net
docker network inspect app-net
docker network connect app-net web
docker volume create app-data
docker volume inspect app-data
```

命名卷由 Docker 管理，bind mount 直接映射宿主机路径。容器删除不等于数据都删除，数据是否保留取决于挂载类型和删除参数。

## 停止和清理

```bash
docker stop web
docker start web
docker rm web              # 删除已停止容器
docker system df
docker image prune        # 交互确认后清理悬空镜像
```

`docker rm -f` 会强制结束容器；卷删除会删除其中数据。先检查资源清单和备份，不要把全局 `prune -a`、卷清理当作无影响的例行命令。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/docker-memo/docker.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/03-容器/13-Docker命令速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
