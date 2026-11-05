---
title: "Dockerfile 速查"
description: "Dockerfile 定义镜像的构建步骤和默认运行方式。把依赖安装放在变化较少的层，把源码复制放在后面，可提高缓存命中率。"
tags: [速查, 容器]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/dockerfile-memo/dockerfile.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

Dockerfile 定义镜像的构建步骤和默认运行方式。把依赖安装放在变化较少的层，把源码复制放在后面，可提高缓存命中率。

## 常用指令

| 指令 | 作用 |
| --- | --- |
| `FROM` | 选择基础镜像，开始构建阶段 |
| `WORKDIR` | 设置后续指令的工作目录 |
| `COPY` | 从构建上下文或其他阶段复制文件 |
| `ADD` | 还支持远程资源和部分归档解包 |
| `RUN` | 构建镜像时执行命令 |
| `ARG` | 构建参数 |
| `ENV` | 设置运行时也可见的环境变量 |
| `USER` | 后续构建步骤及容器默认用户 |
| `CMD` | 默认启动命令或参数，可被运行参数覆盖 |
| `ENTRYPOINT` | 容器入口程序 |
| `EXPOSE` | 声明端口，不自动向宿主机发布 |
| `HEALTHCHECK` | 定义容器健康检查 |
| `LABEL` | 镜像元数据 |

## 分层与非 root 运行

```dockerfile
# syntax=docker/dockerfile:1
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node . .
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

示例需要提交 `package-lock.json`，并有可运行的 `server.js`。标签不是不可变标识，需要精确复现时进一步固定镜像 digest。

## CMD 与 ENTRYPOINT

```dockerfile
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8000"]
```

此时 `docker run image --port 9000` 会替换 CMD 参数，入口仍为 `python app.py`。用 `--entrypoint` 才会覆盖入口。JSON 数组形式不进行 shell 变量展开；需要 shell 时显式调用，并考虑用 `exec` 把信号交给实际进程。

## 多阶段构建

```dockerfile
# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

示例假设应用输出到 `dist`，本 wiki 的输出目录是 `build`，不能不加调整直接套用。

## 构建上下文与密钥

`.dockerignore` 示例：

```text
.git
node_modules
*.log
.env
```

构建密钥使用 BuildKit secret mount；不要用 `ARG`、`ENV` 或先复制后删除的方式隐藏凭据。

```dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
```

```bash
docker build --secret id=npmrc,src="$HOME/.npmrc" -t app:dev .
```

secret mount 不会自动成为镜像层，但运行的程序仍可能把密钥复制进输出或日志，需检查构建步骤。[Docker 构建密钥文档](https://docs.docker.com/build/building/secrets/)说明了两阶段传入方式。

## 构建与检查

```bash
docker build -t app:dev .
docker build --target build -t app:build .
docker build -f docker/Dockerfile.prod -t app:prod .
docker history app:dev
docker run --rm -p 127.0.0.1:3000:3000 app:dev
```

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/dockerfile-memo/dockerfile.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/03-容器/15-Dockerfile速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
