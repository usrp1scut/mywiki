### 查看ceph mgr模块

```bash
[root@vms81 ceph-install]# ceph mgr module ls
{
    "enabled_modules": [
        "balancer",
        "restful",
        "status"
    ],
    "disabled_modules": [
        "dashboard",
        "influx",
        "localpool",
        "prometheus",
        "selftest",
        "telemetry",
        "zabbix"
    ]
}
```

### 启用dashboard

```bash
[root@vms81 ceph-install]# ceph mgr module enable dashboard
```
查看启用状态
```bash
[root@vms81 ceph-install]# ceph mgr module ls
{
    "enabled_modules": [
        "balancer",
        "dashboard",
        "restful",
        "status"
    ],
    "disabled_modules": [
        "influx",
        "localpool",
        "prometheus",
        "selftest",
        "telemetry",
        "zabbix"
    ]
}
```

### dashboard默认监听7000端口

```bash
[root@vms81 ceph-install]# netstat -nltp|grep 7000
tcp6       0      0 :::7000                 :::*                    LISTEN      14427/ceph-mgr
```

![dashboard](/img/ceph-dashboard.png)