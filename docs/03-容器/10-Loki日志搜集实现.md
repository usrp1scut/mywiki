# Loki+Promtail+Grafana实现服务器日志搜集

## 场景描述

ELK日志系统对资源占用明显，功能太复杂，需要一款简便轻量的日志搜集提供给实施工程师直接查询，无需人工多次取日志。

loki是grafana团队推出的轻量级日志管理工具，其相比传统的以es为底层的日志管理工具可降低存储成本10x。其采集插件Promtail支持Windows、Linux及容器等多种部署方式，满足各类系统采集需求。

以Centos7为例搭建Loki+Promtail日志采集，并接入Grafana实时查看

## 部署

[Loki和Promtail下载](https://github.com/grafana/loki/releases/),安装包基本上覆盖所有系统类型

### Loki

下载Loki的RPM安装包

上传到需要部署的服务器

安装
```bash
rpm -ivh loki-2.8.2.x86_64.rpm 
```

配置文件在`/etc/loki/config.yml`，只需要修改监听IP和按需配置存储路径，其余使用默认配置就行

```yml 
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
#Loki监听的IP地址
  instance_addr: 192.168.1.1
#prefix与下面storage的directory保持一致
  path_prefix: /data/loki
  storage:
    filesystem:
      chunks_directory: /data/loki/chunks
      rules_directory: /data/loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h
#没配置alertmanager可以不管
ruler:
  alertmanager_url: http://localhost:9093

# By default, Loki will send anonymous, but uniquely-identifiable usage and configuration
# analytics to Grafana Labs. These statistics are sent to https://stats.grafana.org/
#
# Statistics help us better understand how Loki is used, and they show us performance
# levels for most users. This helps us prioritize features and documentation.
# For more information on what's sent, look at
# https://github.com/grafana/loki/blob/main/pkg/usagestats/stats.go
# Refer to the buildReport method to see what goes into a report.
#
# If you would like to disable reporting, uncomment the following lines:
#analytics:
#  reporting_enabled: false
```
修改配置后重启Loki服务
```bash
systemctl restart loki
```
### Promtail

安装
```bash
rpm -ivh promtail-2.8.2.x86_64.rpm
```

配置文件在`/etc/promtail/config.yml`

```yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0
#保存日志读取的位置信息，停机恢复时用到
positions:
  filename: /tmp/positions.yaml
#loki的地址
clients:
  - url: http://192.168.1.2:3100/loki/api/v1/push
#配置日志收集的job、标签和路径等
scrape_configs:
- job_name: system
  static_configs:
  - targets:
      - localhost
    labels:
      job: varlogs
      __path__: /var/log/*log
- job_name: dataease
#默认使用utf8编码，有些系统应用使用gbk编码需要指定一下，否则会出现中文乱码
 　encoding: gbk
  static_configs:
  - targets:
      - localhost
    labels:
      job: dataeaselog
      __path__: /data/dataease/logs/*/*log
```
修改配置后重启Promtail服务
```bash
systemctl restart promtail
```

:::tip
* redhat6及之前版本无法将promtail注册到systemd需要使用命令手动启动
```bash
nohup /usr/bin/promtail -config.file /etc/promtail/config.yml &
```
* windows命令，可使用 NSSM（Non-Sucking Service Manager）工具注册为服务
```bat
D:\promtail\promtail-windows-amd64.exe --config.file=D:\promtail\config\config.yml
```
:::
