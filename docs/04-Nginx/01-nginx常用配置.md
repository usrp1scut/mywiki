# Nginx 常用配置速查

> 适用场景：日常站点部署、HTTPS 接入、重定向与日志排查。

## 1. 关闭版本号显示

```nginx
server_tokens off;
```

---

## 2. HTTPS 基础配置模板

```nginx
server {
    listen       443 ssl http2 default_server;
    listen       [::]:443 ssl http2 default_server;
    server_name  www.example.com;

    # 网站文件目录
    root /usr/share/nginx/html;

    # SSL 证书路径
    ssl_certificate     /etc/pki/nginx/server.crt;
    ssl_certificate_key /etc/pki/nginx/private/server.key;
    ssl_session_cache   shared:SSL:1m;
    ssl_session_timeout 10m;
    ssl_ciphers         PROFILE=SYSTEM;
    ssl_prefer_server_ciphers on;

    # 其他配置文件
    include /etc/nginx/default.d/*.conf;

    location / {
    }

    error_page 404 /404.html;
    location = /40x.html {}

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {}
}
```

---

## 3. HTTP 强制跳转到 HTTPS

### 推荐写法（`return`）

```nginx
server {
    listen 80;
    server_name www.example.com;
    return 301 https://$host$request_uri;
}
```

### 兼容写法（`rewrite`）

```nginx
server {
    listen 80;
    server_name www.example.com;
    rewrite ^(.*)$ https://$host$1 permanent;
}
```

---

## 4. 按路径重定向（会改变浏览器 URL）

```nginx
location ^~ /news {
    return 301 http://www.example.com$request_uri;
}
```

---

## 5. 日志配置

> 可配置在 main / http / server 层级。

```nginx
# 错误日志
error_log /var/log/nginx/error.log;

# 访问日志
access_log /var/log/nginx/access.log main;

# 日志格式
log_format main '$remote_addr - $http_x_forwarded_for - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$upstream_cache_status" '
                '"$http_cookie" "$cookie_access-key"';
```

---

## 6. `location` 匹配优先级

1. `=` 精确匹配
2. `^~` 前缀匹配（命中后不再走正则）
3. `~` 区分大小写正则匹配
4. `~*` 不区分大小写正则匹配
5. `!~` / `!~*` 正则不匹配
6. 普通前缀匹配（如 `/`）

---

## 7. 文件与目录判断条件

- `-f` / `!-f`：是否为文件
- `-d` / `!-d`：是否为目录
- `-e` / `!-e`：是否存在（文件或目录）
- `-x` / `!-x`：文件是否可执行

---

## 8. `rewrite` 的 flag 说明

1. `last`：本条规则结束后，重新发起 URI 匹配（类似 Apache `[L]`）
2. `break`：匹配后中断，不再执行后续 rewrite 规则
3. `redirect`：返回 `302` 临时重定向
4. `permanent`：返回 `301` 永久重定向

### `last` 与 `break` 的常见选择

- `alias` 场景一般用 `last`
- `proxy_pass` 场景一般用 `break`

> 两者都会保持浏览器地址栏不变（URI 重写）。差异在于是否重新走一次 location 匹配流程。
