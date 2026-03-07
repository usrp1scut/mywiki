# GitLab（Docker Compose）部署示例

## 1. 适用场景

- 使用容器方式快速部署 GitLab CE
- 采用外部 PostgreSQL 数据库
- 需要启用 HTTPS、Registry、Pages、SMTP 等能力

> 说明：本文提供可改造模板，生产环境请按实际域名、证书、密码和资源规划调整。

---

## 2. 前置条件

- 已安装 Docker 与 Docker Compose
- 已准备外部 PostgreSQL（账号/库/网络可达）
- 已准备 TLS 证书（GitLab 主域名、Pages、Registry）
- 已规划宿主机目录挂载路径

---

## 3. docker-compose.yml 示例

```yaml
version: '3.6'
services:
  pub_gitlab:
    image: 'gitlab/gitlab-ce:14.10.2-ce.0'
    privileged: true
    restart: always
    hostname: 'gitlab.example.com'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://gitlab.example.com'
        nginx['redirect_http_to_https'] = true

        # 前端 LB 回源 HTTP 场景（按需启用，启用时需关闭重定向）
        # nginx['listen_port'] = 80
        # nginx['listen_https'] = false

        # 关闭内置 PostgreSQL，使用外部数据库
        postgresql['enable'] = false
        gitlab_rails['db_adapter'] = 'postgresql'
        gitlab_rails['db_encoding'] = 'unicode'
        gitlab_rails['db_host'] = '10.40.2.16'
        gitlab_rails['db_port'] = 5432
        gitlab_rails['db_database'] = 'gitlab'
        gitlab_rails['db_username'] = 'gitlab'
        gitlab_rails['db_password'] = 'gitlab'
        gitlab_rails['pool'] = 10

        # 邮件
        gitlab_rails['gitlab_email_from'] = 'no-reply@example.com'
        gitlab_rails['gitlab_email_reply_to'] = 'no-reply@example.com'
        gitlab_rails['smtp_enable'] = true
        gitlab_rails['smtp_address'] = 'smtp.exmail.qq.com'
        gitlab_rails['smtp_port'] = 465
        gitlab_rails['smtp_user_name'] = 'no-reply@example.com'
        gitlab_rails['smtp_password'] = 'password'
        gitlab_rails['smtp_domain'] = 'smtp.exmail.qq.com'
        gitlab_rails['smtp_authentication'] = 'login'
        gitlab_rails['smtp_enable_starttls_auto'] = true
        gitlab_rails['smtp_tls'] = true
        user['git_user_email'] = 'no-reply@example.com'

        # 头像源（可选）
        gitlab_rails['gravatar_plain_url'] = 'http://sdn.geekzu.org/avatar/%{hash}?s=%{size}&d=identicon'
        gitlab_rails['gravatar_ssl_url'] = 'https://sdn.geekzu.org/avatar/%{hash}?s=%{size}&d=identicon'

        # LFS
        gitlab_rails['lfs_enabled'] = true
        gitlab_rails['lfs_storage_path'] = '/mnt/storage/lfs-objects'
        gitlab_rails['time_zone'] = 'Asia/Shanghai'

        # Pages
        pages_external_url 'https://pages.example.com'
        gitlab_pages['enable'] = true
        gitlab_pages['access_control'] = true
        pages_nginx['ssl_certificate'] = '/etc/gitlab/ssl/pages-nginx.crt'
        pages_nginx['ssl_certificate_key'] = '/etc/gitlab/ssl/pages-nginx.key'

        # Registry
        registry_external_url 'https://gitlab.example.com:5050'
        registry_nginx['ssl_certificate'] = '/etc/gitlab/ssl/lab.co.link.crt'
        registry_nginx['ssl_certificate_key'] = '/etc/gitlab/ssl/lab.co.link.key'
        gitlab_rails['registry_enabled'] = true
        gitlab_rails['registry_path'] = '/mnt/storage/registry'

        # Package
        gitlab_rails['packages_enabled'] = true
        gitlab_rails['packages_storage_path'] = '/mnt/packages'

        # 关闭监控组件（按需）
        grafana['enable'] = false
        prometheus_monitoring['enable'] = false

    ports:
      - '80:80'
      - '443:443'
      - '22:22'
      - '5050:5050'

    volumes:
      - '/gitlab/config:/etc/gitlab'
      - '/gitlab/logs:/var/log/gitlab'
      - '/gitlab/data:/var/opt/gitlab'
      - '/gitlab/images:/mnt/storage/registry'
      # - '/gitlab/lfs:/mnt/storage/lfs-objects'

    logging:
      driver: json-file
      options:
        max-file: '3'
        max-size: 100m

    shm_size: '256m'
```

---

## 4. 启动与验证

### 4.1 启动

```bash
docker-compose up -d
```

### 4.2 查看状态

```bash
docker ps
docker logs -f pub_gitlab
```

### 4.3 功能验证

- Web 页面可访问（HTTPS）
- SSH clone 正常
- SMTP 邮件可发送
- Registry 推拉镜像正常
- Pages 站点可访问

---

## 5. 运维建议

- 数据目录与证书目录务必持久化
- 建议定期备份 GitLab 配置、仓库数据和外部 PostgreSQL
- 生产环境请将明文密码改为密钥管理或环境注入方式
- 升级前先在测试环境演练并验证备份可恢复

---

## 6. 常见问题

### Q1：启动后页面 502 / 500

- 检查外部 PostgreSQL 连通性与账号权限
- 检查 `external_url` 与证书是否匹配
- 观察 `docker logs` 与 `/gitlab/logs` 下日志

### Q2：邮件发送失败

- 检查 SMTP 账号密码与端口/TLS 设置
- 检查服务器出站网络（465/587）
