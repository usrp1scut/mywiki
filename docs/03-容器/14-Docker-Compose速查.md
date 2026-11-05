---
title: "Docker Compose 速查"
description: "用 `compose.yaml` 声明多容器应用，再通过 `docker compose` 管理。以下采用 Compose 插件命令，不使用旧版独立程序 `docker-compose`。"
tags: [速查, 容器]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/docker-compose-memo/docker-compose.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

用 `compose.yaml` 声明多容器应用，再通过 `docker compose` 管理。以下采用 Compose 插件命令，不使用旧版独立程序 `docker-compose`。

## 一个可运行的最小配置

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "127.0.0.1:8080:80"
    restart: unless-stopped
    volumes:
      - site:/usr/share/nginx/html

volumes:
  site:
```

当前 Compose Specification 不要求顶层 `version`。端口映射加引号，缩进用空格。可以使用 [YAML 工具](/tools#yaml)检查语法，但实际配置应再用 `docker compose config` 验证。

## 常用命令

```bash
docker compose config
docker compose up -d
docker compose up -d --build
docker compose ps
docker compose logs -f --tail 100 web
docker compose exec web sh
docker compose run --rm web nginx -t
docker compose pull
docker compose restart web
docker compose stop
docker compose down
```

`exec` 在已有容器里执行，`run` 为一次性任务创建新容器。修改环境变量或服务配置后应 `up -d` 重建需要更新的容器，单独 `restart` 不会应用全部配置变更。

`down` 删除项目容器与网络；`down -v` 还会删除相关命名卷和匿名卷，会影响持久化数据。声明为 external 的资源由外部管理。

## 环境变量的两层含义

```yaml
services:
  app:
    image: "myapp:${APP_TAG:-dev}"
    environment:
      LOG_LEVEL: "${LOG_LEVEL:-info}"
    env_file:
      - app.env
```

- shell、`.env`、CLI 的 `--env-file` 为 Compose 文件的变量插值提供值。
- 服务下的 `environment`、`env_file` 为容器提供环境变量。
- `.env` 中有一个变量，不等于它自动进入容器。
- `$$` 用于在 Compose 插值阶段保留字面的美元符号。

```bash
docker compose --env-file staging.env config
docker compose config --environment
```

配置输出可能包含展开后的密码，分享前先检查。准确的读取顺序及项目目录规则见 [Docker 插值文档](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/)。

## 就绪检查与依赖

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: "${DB_PASSWORD:?请设置 DB_PASSWORD}"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10
  app:
    image: myapp:dev
    depends_on:
      db:
        condition: service_healthy
```

这是依赖关系片段，`myapp:dev` 需要替换为实际镜像。简单的 `depends_on` 只表达启动顺序；要等待服务健康需配置 healthcheck 和条件，应用自身仍应处理断线重试。

## 多文件、配置档与扩展

```bash
docker compose -f compose.yaml -f compose.prod.yaml config
docker compose --profile debug up -d
docker compose up -d --scale worker=3
```

多文件合并先看最终 `config`。需要扩副本的服务不要设置固定 `container_name`，也要避免多个副本竞争同一宿主机端口。Swarm 的 `docker stack deploy` 不等于 Compose，见 [Swarm 速查](./16-Docker-Swarm速查.md)。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/docker-compose-memo/docker-compose.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/03-容器/14-Docker-Compose速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
