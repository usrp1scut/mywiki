* 环境配置，需安装docker和docker-compose

`vi docker-compose.yml`

```yml
version: '3.6'
services:
  pub_gitlab:
    image: 'gitlab/gitlab-ce:14.10.2-ce.0'
    privileged: true 
    restart: always
    hostname: 'gitlab.example.com'
    environment:
            #GITLAB_SKIP_UNMIGRATED_DATA_CHECK: 'true'
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://gitlab.example.com'
        nginx['redirect_http_to_https'] = true
        #前端使用LB配置ssl回源http可使用以下配置，同时需禁用重定向,registry和pages同理
        #nginx['listen_port'] = 80
        #nginx['listen_https'] = false
        #registry_nginx['listen_port'] = 5050
        #registry_nginx['listen_https'] = false
        #pages_nginx['listen_port'] = 5050
        #pages_nginx['listen_https'] = false
        #关闭自带pgsql模块
        postgresql['enable'] = false
        gitlab_rails['db_adapter'] = 'postgresql'
        gitlab_rails['db_encoding'] = 'unicode'
        gitlab_rails['pool'] = 10
        #外部pgsql地址、库名、账号、密码及端口
        gitlab_rails['db_host'] = '10.40.2.16'
        gitlab_rails['db_database'] = 'gitlab'
        gitlab_rails['db_username'] = 'gitlab'
        gitlab_rails['db_password'] = 'gitlab'
        gitlab_rails['db_port'] = 5432
        #设置发送邮件的邮箱
        gitlab_rails['gitlab_email_from'] = 'no-reply@example.com'
        gitlab_rails['gitlab_email_reply_to'] = 'no-reply@example.com'
        #启用smtp邮件发送
        gitlab_rails['smtp_enable'] = true
        gitlab_rails['smtp_address'] = "smtp.exmail.qq.com"
        gitlab_rails['smtp_port'] = 465
        gitlab_rails['smtp_user_name'] = "no-reply@example.com"
        gitlab_rails['smtp_password'] = "password"
        gitlab_rails['smtp_domain'] = "smtp.exmail.qq.com"
        gitlab_rails['smtp_authentication'] = "login"
        gitlab_rails['smtp_enable_starttls_auto'] = true
        gitlab_rails['smtp_tls'] = true
        user["git_user_email"] = "no-reply@example.com"
        #设置自动分配头像图标库，使用默认出现图裂
        gitlab_rails['gravatar_plain_url'] = 'http://sdn.geekzu.org/avatar/%{hash}?s=%{size}&d=identicon'
        gitlab_rails['gravatar_ssl_url'] = 'https://sdn.geekzu.org/avatar/%{hash}?s=%{size}&d=identicon'
        gitlab_rails['lfs_enabled'] = true
        gitlab_rails['lfs_storage_path'] = "/mnt/storage/lfs-objects"
        gitlab_rails['time_zone'] = 'Asia/Shanghai'
        #配置静态页面展示模块pages
        pages_external_url "https://pages.example.com"
        gitlab_pages['enable'] = true
        gitlab_pages['access_control'] = true
        pages_nginx['ssl_certificate'] = "/etc/gitlab/ssl/pages-nginx.crt"
        pages_nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/pages-nginx.key"
        #配置容器镜像库
        registry_external_url 'https://gitlab.example.com:5050'
        registry_nginx['ssl_certificate'] = "/etc/gitlab/ssl/lab.co.link.crt"
        registry_nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/lab.co.link.key"
        gitlab_rails['registry_enabled'] = true
        gitlab_rails['registry_path'] = "/mnt/storage/registry"
        gitlab_rails['packages_enabled'] = true
        gitlab_rails['packages_storage_path'] = "/mnt/packages"
        gitlab_rails['pool'] = 10
        #关闭grafana和prometheus
        grafana['enable'] = false
        prometheus_monitoring['enable'] = false
    #主机端口映射
    ports:
      - '80:80'
      - '443:443'
      - '22:22'
      - '5050:5050'
    #主机目录映射
    volumes:
      - '/gitlab/config:/etc/gitlab'
      - '/gitlab/logs:/var/log/gitlab'
      - '/gitlab/data:/var/opt/gitlab'
      - '/gitlab/images:/mnt/storage/registry'
        #- '/gitlab/lfs:/mnt/storage/lfs-objects'
    #日志参数配置
    logging:
      driver: json-file
      options:
        max-file: '3'
        max-size: 100m
    shm_size: '256m'
```

`docker-compose up`