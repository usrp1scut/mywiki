---
title: "Nginx 命令与配置速查"
description: "整理 Nginx 的检查、平滑重载、配置层级、路径转发和排障入口。完整 HTTPS、日志和 location 示例见 [Nginx 常用配置](./01-nginx常用配置.md)。"
tags: [速查, Nginx]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/nginx-memo/nginx-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

整理 Nginx 的检查、平滑重载、配置层级、路径转发和排障入口。完整 HTTPS、日志和 location 示例见 [Nginx 常用配置](./01-nginx常用配置.md)。

## 检查与重载

```bash
nginx -t                      # 检查语法并尝试打开引用文件
nginx -T                      # 检查并打印展开 include 后的配置
nginx -V                      # 版本与编译参数
sudo systemctl status nginx
sudo nginx -t && sudo systemctl reload nginx
```

systemctl 适用于使用 systemd 管理 Nginx 的环境；容器或其他安装方式可使用 `nginx -s reload` 等对应入口。`nginx -T` 读取磁盘配置，不是正在运行的旧配置快照；输出中也可能有敏感信息。

## 配置层级

```nginx
events {
    worker_connections 1024;
}

http {
    include mime.types;
    server {
        listen 80;
        server_name wiki.example.com;
        root /srv/wiki;

        location / {
            try_files $uri $uri/ =404;
        }
    }
}
```

这是结构示例，合并到已有配置时不要重复包裹 `http`。`mime.types` 的解析路径与安装配置有关；站点目录也要让 worker 用户具有读取与逐级目录查找权限。

## location 与反向代理

| 写法 | 用途 |
| --- | --- |
| `location = /health` | 精确匹配 |
| `location /api/` | 前缀匹配 |
| `location ^~ /assets/` | 命中最长此前缀时，跳过正则竞争 |
| `location ~ \.php$` | 区分大小写的正则 |
| `location ~* \.(jpg\|png)$` | 不区分大小写的正则 |

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

在这个普通前缀 location 中，带 URI `/` 的 `proxy_pass` 把 `/api/users` 转成上游 `/users`；不带尾部 `/` 的 `proxy_pass http://127.0.0.1:3000;` 保留 `/api/users`。正则 location、变量和 rewrite 场景另有规则，不应只按「有没有斜杠」机械套用。

## 重定向与排错

```nginx
server {
    listen 80;
    server_name wiki.example.com;
    return 301 https://wiki.example.com$request_uri;
}
```

```bash
curl -I http://127.0.0.1/ -H 'Host: wiki.example.com'
tail -n 100 /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

| 现象 | 优先查看 |
| --- | --- |
| 403 | 目录逐级权限、index、访问控制与安全模块 |
| 404 | 实际匹配的 server/location、root/alias、URI 转换 |
| 502 | 上游是否监听、连接错误和应用日志 |
| 504 | 上游耗时、超时位置和应用负载 |

日志路径以实际配置为准。TLS 内容解析可用 [证书工具](/tools#certificate)，解析结果不代表证书链已被信任。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/nginx-memo/nginx-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/04-Nginx/08-Nginx命令与配置速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
