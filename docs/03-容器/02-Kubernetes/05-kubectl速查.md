---
title: "kubectl 速查"
description: "查询 Kubernetes 集群上下文、资源、日志、发布和节点维护命令。执行任何写操作前，先确认 context 与 namespace，避免操作错集群。"
tags: [速查, Kubernetes]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/k8s-memo/k8s-memo.content.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

查询 Kubernetes 集群上下文、资源、日志、发布和节点维护命令。执行任何写操作前，先确认 context 与 namespace，避免操作错集群。

## 上下文与命名空间

```bash
kubectl config current-context
kubectl config get-contexts
kubectl config use-context <上下文>
kubectl config set-context --current --namespace=<命名空间>
kubectl get namespaces
```

`-n <命名空间>` 只影响本次命令。切换工具见 [kubens 笔记](./99-namespace切换工具kubens.md)。

## 资源查询

```bash
kubectl get pods -A -o wide
kubectl get pods -n app -l app=web
kubectl get deployment web -n app -o yaml
kubectl describe pod <Pod名> -n app
kubectl get events -n app --sort-by=.metadata.creationTimestamp
kubectl api-resources
kubectl explain deployment.spec.template.spec.containers
kubectl get pods -n app -o jsonpath='{.items[*].metadata.name}'
```

`kubectl get all` 中的 `all` 是资源类别，并不列出命名空间内的一切资源，例如 Secret、ConfigMap、部分自定义资源不在其中。

## 生成、对比与应用

```bash
kubectl create deployment web --image=nginx:alpine --dry-run=client -o yaml > web.yaml
kubectl diff -n app -f web.yaml
kubectl apply -n app -f web.yaml
kubectl apply -k ./overlays/staging
```

客户端 dry-run 用于生成对象，不等于服务端准入检查；`diff` 有差异时退出码为 1，不一定是错误。YAML 文本可先用 [格式与语法工具](/tools#yaml)整理。

## 日志与容器排查

```bash
kubectl logs <Pod名> -n app --tail=100
kubectl logs <Pod名> -n app -c <容器名> --previous
kubectl logs -f <Pod名> -n app -c <容器名>
kubectl exec -it <Pod名> -n app -c <容器名> -- sh
kubectl port-forward -n app service/web 8080:80
kubectl top pods -n app
kubectl top nodes
```

`--previous` 读取该 Pod 内容器上一实例的日志；Pod 被删除后不保证仍可取得。`top` 依赖可用的 Metrics API。`port-forward` 默认仅本机访问，停止命令后转发结束。

## 扩容、发布与回滚

```bash
kubectl scale deployment/web -n app --replicas=3
kubectl set image deployment/web -n app nginx=nginx:<新标签>
kubectl rollout status deployment/web -n app
kubectl rollout history deployment/web -n app
kubectl rollout undo deployment/web -n app
kubectl rollout restart deployment/web -n app
```

容器名 `nginx` 必须与 Deployment 中的实际名字一致。回滚 Deployment 不会还原外部数据库或独立 ConfigMap 的内容。

## 节点维护与权限

```bash
kubectl auth can-i get pods -n app
kubectl cordon <节点>
kubectl drain <节点> --ignore-daemonsets
kubectl uncordon <节点>
```

drain 会驱逐任务，应先评估 PodDisruptionBudget、其他节点容量和本地数据。命令因保护条件停止时先查原因，不要默认加 `--force` 或 `--delete-emptydir-data`。`kubectl delete --force` 也不保证节点上的进程已真正退出。

Pod 结构与生命周期见 [Pod 基础](./02-pod基础.md)。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/k8s-memo/k8s-memo.content.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/03-容器/02-Kubernetes/05-kubectl速查.md)可用于修改和再分发。

[返回开发运维速查目录](../../00-开发运维速查.md)
