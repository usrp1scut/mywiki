---
title: "Docker Swarm 速查"
description: "Swarm 将多台 Docker 主机组成集群，由 manager 维护状态，worker 执行任务。service 描述期望状态，task 是某个副本的调度单元，stack 是一组服务的部署集合。"
tags: [速查, 容器]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/docker-swarm-memo/docker-swarm.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

Swarm 将多台 Docker 主机组成集群，由 manager 维护状态，worker 执行任务。service 描述期望状态，task 是某个副本的调度单元，stack 是一组服务的部署集合。

## 初始化与节点

```bash
docker swarm init --advertise-addr <管理节点IP>
docker swarm join-token worker
# 在待加入的节点执行上一条输出的 join 命令
docker node ls
docker node inspect --pretty <节点>
docker node ps <节点>
docker node update --availability drain <节点>
docker node update --availability active <节点>
```

join token 允许节点加入集群，按凭据管理。`drain` 会迁移或终止该节点上的服务任务，维护前确认其他节点容量和应用副本数。

manager 使用多数派维持一致性；3 个 manager 通常可容忍 1 个不可用，5 个可容忍 2 个。工作节点数量不能替代 manager 仲裁。

## 服务、扩容与更新

```bash
docker service create --name web --replicas 3 --publish 8080:80 nginx:alpine
docker service ls
docker service ps --no-trunc web
docker service inspect --pretty web
docker service logs --tail 100 web
docker service scale web=5
docker service update --image nginx:<新标签> --update-parallelism 1 web
docker service rollback web
```

更新镜像前选择经过验证的版本。rollback 回退服务配置，不会自动回滚数据库或持久化数据。

## 网络与端口

```bash
docker network create --driver overlay app-net
docker service update --network-add app-net web
```

| 集群节点之间的端口 | 用途 |
| --- | --- |
| TCP 2377 | 集群管理通信 |
| TCP/UDP 7946 | 节点发现和通信 |
| UDP 4789 | 默认 overlay 数据流量 |

这些端口应仅对可信集群网络开放。默认 ingress 发布使用 routing mesh；`mode=host` 则在运行任务的节点直接绑定端口，两种方式的副本分布和端口冲突条件不同。

## Stack 部署

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

```bash
docker stack deploy -c stack.yaml demo
docker stack services demo
docker stack ps --no-trunc demo
```

`stack deploy` 使用其支持的 Compose 文件格式，不能把现代 Compose 的全部功能原样搬入。镜像要事先构建并放在各节点可访问的位置，不能依赖 `build` 在集群部署时构建。

## 配置与密钥

```bash
docker secret create db_password ./db-password.txt
docker secret ls
docker config create nginx_config ./nginx.conf
docker config ls
```

secret 挂载给服务后通常位于 `/run/secrets/名称`；config 适用于非敏感配置。删除 service、stack 或离开 swarm 都会改变运行状态，先检查关联任务和存储，再执行对应移除命令。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/docker-swarm-memo/docker-swarm.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/03-容器/16-Docker-Swarm速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
