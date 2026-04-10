---
title: LXCFS 容器资源视图适配
description: 记录基于 LXCFS v6.0.6 的镜像打包、Kubernetes DaemonSet 部署和业务 Pod 启用方式。
tags:
  - 容器
  - Kubernetes
  - LXCFS
keywords:
  - LXCFS
  - FUSE
  - 资源视图
  - proc
  - DaemonSet
owner: Jacob
updated: 2026-04-10
difficulty: L2
---

## 1. 背景与目标

- 背景：容器内的 `top`、`free`、`uptime`、部分 JVM/Go/Node 运行时探测逻辑通常会读取 `/proc` 或 cgroup 信息。如果不做额外适配，应用看到的 CPU、内存、负载等信息可能更接近宿主机视图，而不是容器 limit/request 对应的视图。
- 目标：在 Kubernetes 节点上部署 LXCFS，并让需要适配的业务 Pod 挂载 LXCFS 生成的虚拟 `/proc` 文件，使容器内资源视图更接近自身限制。
- 适用对象：需要在容器内读取 CPU、内存、负载等系统信息的业务，尤其是对 `/proc/meminfo`、`/proc/cpuinfo`、`/proc/stat`、`/proc/uptime` 敏感的应用。

## 2. 适用范围

- 系统/组件：Kubernetes Linux 节点、LXCFS、FUSE、业务 Pod。
- 版本范围：本文示例使用 `LXCFS_VERSION=6.0.6`，镜像 tag 为 `lxcfs:v6.0.6`。
- 环境范围：建议先在 dev/staging 验证，再灰度到 prod。
- 不适用场景：不需要容器内资源视图修正的无状态服务；不允许 privileged DaemonSet 或 hostPath 挂载的高隔离集群；节点没有 `/dev/fuse` 或禁用 FUSE 的环境。

## 3. 前置条件

- [ ] 已确认目标节点为 Linux 节点，并存在 `/dev/fuse`。
- [ ] 已确认集群允许部署 `privileged: true` 的 DaemonSet。
- [ ] 已确认镜像仓库可推送和拉取 `xxxx.hub/lxcfs:v6.0.6`。
- [ ] 已准备本文对应的 `Dockerfile` 和 `deployment.yaml`。
- [ ] 已选定需要启用 LXCFS 资源视图的业务 Pod，并确认可以修改其 `volumeMounts` 与 `volumes`。

## 4. 变更信息

| 项目 | 内容 |
| --- | --- |
| 变更类型 | 新增 |
| 风险等级 | 中 |
| 预计时长 | 30-60 分钟 |
| 影响范围 | LXCFS DaemonSet 覆盖的 Linux 节点；手动挂载 LXCFS 的业务 Pod |

## 5. 实施步骤

### 步骤 1：构建 LXCFS 镜像

目的：基于 Ubuntu 22.04 编译安装指定版本的 LXCFS，并以 `/usr/bin/lxcfs` 作为容器入口。

Dockerfile 关键逻辑：

```dockerfile
FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
ARG LXCFS_VERSION=6.0.6

RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf \
    automake \
    build-essential \
    ca-certificates \
    curl \
    fuse3 \
    git \
    help2man \
    libcap-dev \
    libcurl4-openssl-dev \
    libfuse3-dev \
    libnuma-dev \
    libseccomp-dev \
    libselinux1-dev \
    libsqlite3-dev \
    libsystemd-dev \
    libudev-dev \
    libtool \
    make \
    meson \
    ninja-build \
    pkg-config \
    python3 \
    python3-jinja2 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /src

RUN git clone --branch "v${LXCFS_VERSION}" --depth 1 https://github.com/lxc/lxcfs.git .

RUN meson setup build -Dinit-script=sysvinit --prefix=/usr \
  && meson compile -C build \
  && meson install -C build

RUN mkdir -p /var/lib/lxcfs

ENTRYPOINT ["/usr/bin/lxcfs"]
CMD ["-f", "-l", "--enable-cfs", "--enable-pidfd", "/var/lib/lxcfs"]
```

操作：

```bash
docker build \
  --build-arg LXCFS_VERSION=6.0.6 \
  -t xxxx.hub/lxcfs:v6.0.6 \
  .

docker push xxxx.hub/lxcfs:v6.0.6
```

预期结果：镜像构建成功并推送到仓库，后续节点可以拉取该镜像。

### 步骤 2：部署 LXCFS DaemonSet

目的：在每个 Linux 节点上运行一个 LXCFS 进程，将 FUSE 文件系统挂载到宿主机 `/var/lib/lxcfs`。

附件中的 `deployment.yaml` 主要包含：

- 创建 `lxcfs` Namespace 和 ServiceAccount。
- 使用 DaemonSet 部署 `lxcfs`，并通过 `nodeSelector` 限制在 Linux 节点运行。
- 设置 `hostPID: true`、`privileged: true`，并额外添加 `SYS_ADMIN` capability。
- 以 `-f -l --enable-cfs --enable-pidfd /var/lib/lxcfs` 启动 LXCFS。
- 通过 `hostPath` 挂载宿主机 `/var/lib/lxcfs`，并设置 `mountPropagation: Bidirectional`。
- 挂载宿主机 `/dev/fuse`，类型为 `CharDevice`。
- 在 `preStop` 中执行 `fusermount3 -u /var/lib/lxcfs || true`，尽量在 Pod 退出前卸载 FUSE 挂载点。

示例 `deployment.yaml`：

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: lxcfs
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: lxcfs
  namespace: lxcfs
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: lxcfs
  namespace: lxcfs
  labels:
    app: lxcfs
spec:
  selector:
    matchLabels:
      app: lxcfs
  updateStrategy:
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: lxcfs
    spec:
      serviceAccountName: lxcfs
      hostPID: true
      terminationGracePeriodSeconds: 30
      nodeSelector:
        kubernetes.io/os: linux
      tolerations:
        - operator: Exists
      containers:
        - name: lxcfs
          image: xxxx.hub/lxcfs:v6.0.6
          imagePullPolicy: IfNotPresent
          securityContext:
            privileged: true
            capabilities:
              add:
                - SYS_ADMIN
          args:
            - -f
            - -l
            - --enable-cfs
            - --enable-pidfd
            - /var/lib/lxcfs
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          lifecycle:
            preStop:
              exec:
                command:
                  - /bin/sh
                  - -c
                  - fusermount3 -u /var/lib/lxcfs || true
          volumeMounts:
            - name: lxcfs-root
              mountPath: /var/lib/lxcfs
              mountPropagation: Bidirectional
            - name: dev-fuse
              mountPath: /dev/fuse
      volumes:
        - name: lxcfs-root
          hostPath:
            path: /var/lib/lxcfs
            type: DirectoryOrCreate
        - name: dev-fuse
          hostPath:
            path: /dev/fuse
            type: CharDevice
```
操作：

```bash
kubectl apply -f deployment.yaml
```

预期结果：`lxcfs` 命名空间下 DaemonSet 创建成功，每个符合条件的 Linux 节点都有一个 `lxcfs` Pod。

## 6. 验证与验收

功能验证：确认 DaemonSet 就绪。

```bash
kubectl -n lxcfs get daemonset lxcfs
kubectl -n lxcfs get pod -o wide -l app=lxcfs
```

日志验证：确认 LXCFS 正常启动，没有持续 FUSE 挂载报错。

```bash
kubectl -n lxcfs logs -l app=lxcfs --tail=100
```

节点验证：确认宿主机上已经生成 LXCFS 挂载内容。

```bash
mount | grep lxcfs
ls -l /var/lib/lxcfs
ls -l /var/lib/lxcfs/proc
```

业务容器验证：给测试 Pod 启用 LXCFS 后，在容器内对比资源视图。

```bash
cat /proc/meminfo | head
cat /proc/cpuinfo | grep '^processor' | wc -l
cat /proc/loadavg
cat /proc/uptime
```

验收标准：

- [ ] `lxcfs` DaemonSet 期望副本和可用副本一致。
- [ ] 每个目标 Linux 节点均存在 `/var/lib/lxcfs` 挂载。
- [ ] 启用 LXCFS 的测试 Pod 内，`/proc/meminfo`、`/proc/cpuinfo` 等信息符合容器资源限制预期。
- [ ] LXCFS Pod 日志无持续重启、挂载失败或权限错误。

## 7. 启用方法

注意：部署 DaemonSet 只是让节点具备 LXCFS 能力；业务 Pod 还需要挂载 LXCFS 生成的文件，才会真正启用资源视图适配。当前附件未包含 admission webhook，因此这里给出手动挂载方式。

示例：给业务 Pod 覆盖常用 `/proc` 文件。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
spec:
  template:
    spec:
      containers:
        - name: app
          image: nginx:1.25
          resources:
            limits:
              cpu: "2"
              memory: 2Gi
          volumeMounts:
            - name: lxcfs-proc-cpuinfo
              mountPath: /proc/cpuinfo
              readOnly: true
            - name: lxcfs-proc-meminfo
              mountPath: /proc/meminfo
              readOnly: true
            - name: lxcfs-proc-stat
              mountPath: /proc/stat
              readOnly: true
            - name: lxcfs-proc-uptime
              mountPath: /proc/uptime
              readOnly: true
            - name: lxcfs-proc-loadavg
              mountPath: /proc/loadavg
              readOnly: true
      volumes:
        - name: lxcfs-proc-cpuinfo
          hostPath:
            path: /var/lib/lxcfs/proc/cpuinfo
            type: File
        - name: lxcfs-proc-meminfo
          hostPath:
            path: /var/lib/lxcfs/proc/meminfo
            type: File
        - name: lxcfs-proc-stat
          hostPath:
            path: /var/lib/lxcfs/proc/stat
            type: File
        - name: lxcfs-proc-uptime
          hostPath:
            path: /var/lib/lxcfs/proc/uptime
            type: File
        - name: lxcfs-proc-loadavg
          hostPath:
            path: /var/lib/lxcfs/proc/loadavg
            type: File
```

可选挂载项：如果节点的 `/var/lib/lxcfs/proc` 下存在 `diskstats`、`swaps` 等文件，并且业务确实依赖这些信息，也可以按同样方式挂载到容器内对应路径。

```yaml
volumeMounts:
  - name: lxcfs-proc-diskstats
    mountPath: /proc/diskstats
    readOnly: true
  - name: lxcfs-proc-swaps
    mountPath: /proc/swaps
    readOnly: true
volumes:
  - name: lxcfs-proc-diskstats
    hostPath:
      path: /var/lib/lxcfs/proc/diskstats
      type: File
  - name: lxcfs-proc-swaps
    hostPath:
      path: /var/lib/lxcfs/proc/swaps
      type: File
```

建议：不要把整个 `/var/lib/lxcfs/proc` 目录直接覆盖挂载到容器的 `/proc`，只挂载需要替换的具体文件。

## 8. 回滚方案

回滚触发条件：业务 Pod 启动失败、容器内系统信息异常、LXCFS DaemonSet 持续重启、节点 FUSE 挂载异常。

回滚步骤：

```bash
# 1. 先从业务 Deployment/StatefulSet 中移除 LXCFS volumeMounts 和 volumes
kubectl apply -f app-without-lxcfs.yaml

# 2. 确认业务 Pod 恢复正常后，按需删除 LXCFS DaemonSet
kubectl delete -f deployment.yaml

# 3. 如果节点上仍残留挂载，可在节点侧检查后手动卸载
mount | grep lxcfs
sudo fusermount3 -u /var/lib/lxcfs || true
```

回滚后验证：

```bash
kubectl -n lxcfs get pod -l app=lxcfs
kubectl get pod -A | grep -E 'Error|CrashLoopBackOff|ImagePullBackOff'
```

## 9. 风险与影响

- 风险点 1：DaemonSet 需要 `privileged: true`、`SYS_ADMIN`、`hostPID` 和 hostPath 挂载，属于高权限组件，建议限制镜像来源和变更权限。
- 风险点 2：业务 Pod 挂载 `/proc/*` 文件后，部分依赖宿主机真实视图的程序可能表现变化，需要逐个业务验证。
- 风险点 3：如果 LXCFS Pod 异常退出或节点 FUSE 挂载异常，新创建的业务 Pod 可能因为 hostPath 文件不存在而启动失败。
- 影响说明：部署 DaemonSet 本身不会自动影响业务 Pod；只有显式挂载 LXCFS 文件的业务才会改变资源视图。
- 缓解措施：先在测试命名空间验证；按业务灰度启用；保留原始 workload YAML；监控 LXCFS DaemonSet 可用性和业务 Pod 重启情况。

## 10. 常见问题（FAQ）

### Q1：为什么部署了 DaemonSet 后，业务容器里 `free` 看到的内存还是宿主机内存？

A：DaemonSet 只是在节点上准备 `/var/lib/lxcfs`。业务容器还需要把 `/var/lib/lxcfs/proc/meminfo` 挂载到容器内 `/proc/meminfo`，否则应用仍然读取原始 `/proc`。

### Q2：是否需要所有业务 Pod 都启用 LXCFS？

A：不建议默认全量启用。优先给确实依赖系统资源视图的服务启用，例如 JVM 参数自动推导、运行时 CPU 探测、监控采集或容量判断对 `/proc` 敏感的服务。

### Q3：为什么 DaemonSet 要使用 `mountPropagation: Bidirectional`？

A：LXCFS 在容器内启动 FUSE 挂载点，需要让这个挂载变化传播到宿主机的 `/var/lib/lxcfs`，再供业务 Pod 通过 hostPath 挂载使用。

### Q4：`--enable-cfs` 和 `--enable-pidfd` 是做什么的？

A：本文附件中的启动参数启用了 CFS 相关处理和 pidfd 相关能力，用于更好地结合容器 cgroup 信息生成资源视图。具体行为需要结合当前 LXCFS 版本和节点内核能力验证。

## 11. 参考资料

- LXCFS 官方仓库：https://github.com/lxc/lxcfs
- Ubuntu 介绍文章：https://ubuntu.com/blog/2015/03/02/introducing-lxcfs
