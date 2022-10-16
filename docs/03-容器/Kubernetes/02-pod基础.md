## 创建pod

一个pod可以包含多个容器，pod内的容器共享存储空间和网络空间

```yaml
apiVersion: v1
kind: Pod
metadata:
  #pod名称
  name: static-web
  #标签
  labels:
    role: myrole
spec:
  containers:
    #容器名称 
  - name: web
    #使用的镜像名
    image: nginx
    #暴露容器端口
    ports: 
    - name: web
      containerPort: 80
      protocol: TCP
```

## pod基本操作

```bash

kubectl exec 命令
kubectl exec -it pod sh #如果pod里有多个容器，则命令是在第一个容器里执行
kubectl exec -it demo -c demo1 sh
kubectl describe pod pod名
kubectl logs pod名 -c 容器名 #如果有多个容器的话
kubectl edit pod pod名  #修改pod配置
```

## pod运行命令配置

### 1写法

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers: 
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo OK! && sleep 60']
```

### 2写法
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers: 
  - name: myapp-container
    image: busybox
    command: 
    - sh
    - -c
    - echo OK! && sleep 60
```

### 3写法

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers: 
  - name: myapp-container
    image: busybox
    args: 
    - sh
    - -c
    - echo OK! && sleep 60
```

## pod生命周期lifecycle
### poststart和prestop

Kubernetes 在容器创建后立即发送 postStart 事件。 然而，postStart 处理函数的调用不保证早于容器的入口点（entrypoint） 的执行。postStart 处理函数与容器的代码是异步执行的，但 Kubernetes 的容器管理逻辑会一直阻塞等待 postStart 处理函数执行完毕。 只有 postStart 处理函数执行完毕，容器的状态才会变成 RUNNING。

Kubernetes 在容器结束前立即发送 preStop 事件。除非 Pod 宽限期限spec.terminationGracePeriodSeconds超时，Kubernetes 的容器管理逻辑 会一直阻塞等待 preStop 处理函数执行完毕。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
spec:
  containers:
  - name: lifecycle-demo-container
    image: nginx
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "echo Hello from the postStart handler > /usr/share/message"]
      preStop:
        exec:
          command: ["/bin/sh","-c","nginx -s quit; while killall -0 nginx; do sleep 1; done"]
```

## 在pod中使用变量

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: demo
  labels:
    purpose: demonstrate-envars
spec:
  containers: 
  - name: env-demo
    image: nginx
    env:
    - name: DEMOx
      value: "Hello x sir" 
    - name: DEMOy
      value: "Hello y sir"
    #验证变量值
    command: ["/bin/echo"]
    args: ["$(DEMOx)"]  
```

## pod状态和重启策略
### 状态
* Pending    pod因为其他的原因导致pod准备开始创建 还没有创建（卡住了）
* Running    pod已经被调度到节点上，且容器工作正常
* Completed  pod里所有容器正常退出
* error
  * CrashLoopBackOff   创建的时候就出错，属于内部原因
  * imagePullBackoff   创建pod的时候，镜像下载失败

### 重启策略

* Always 总是重启
* OnFailure 非正常退出才重启
* Never 从不重启

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  restartPolicy: Never
  containers: 
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo The app is  running! && sleep 60']
```

## 初始化容器

Init 容器是一种特殊容器，在 Pod 内的应用容器启动之前运行。Init 容器可以包括一些应用镜像中不存在的实用工具和安装脚本。

每个 Pod 中可以包含多个容器， 应用运行在这些容器里面，同时 Pod 也可以有一个或多个先于应用容器启动的 Init 容器。

因为 Init 容器具有与应用容器分离的单独镜像，其启动相关代码具有如下优势：

* Init 容器可以包含一些安装过程中应用容器中不存在的实用工具或个性化代码。 例如，没有必要仅为了在安装过程中使用类似 sed、awk、python 或 dig 这样的工具而去 FROM 一个镜像来生成一个新的镜像。

* 应用镜像的创建者和部署者可以各自独立工作，而没有必要联合构建一个单独的应用镜像。

* 与同一 Pod 中的多个应用容器相比，Init 容器能以不同的文件系统视图运行。因此，Init 容器可以被赋予访问应用容器不能访问的 Secret 的权限。

* 由于 Init 容器必须在应用容器启动之前运行完成，因此 Init 容器提供了一种机制来阻塞或延迟应用容器的启动，直到满足了一组先决条件。 一旦前置条件满足，Pod 内的所有的应用容器会并行启动。

* Init 容器可以安全地运行实用程序或自定义代码，而在其他方式下运行这些实用程序或自定义代码可能会降低应用容器镜像的安全性。 通过将不必要的工具分开，你可以限制应用容器镜像的被攻击范围。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app.kubernetes.io/name: MyApp
spec:
  containers:
  - name: myapp-container
    image: busybox:1.28
    command: ['sh', '-c', 'echo The app is running! && sleep 3600']
  initContainers:
  - name: init-myservice
    image: busybox:1.28
    command: ['sh', '-c', "until nslookup myservice.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for myservice; sleep 2; done"]
  - name: init-mydb
    image: busybox:1.28
    command: ['sh', '-c', "until nslookup mydb.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for mydb; sleep 2; done"]
```

### init容器规则

* 它们总是运行到完成。
* 每个都必须在下一个启动之前成功完成。
* 如果 Pod 的 Init 容器失败，Kubernetes 会不断地重启该 Pod，直到 Init 容器成功为止。然而，如果 Pod 对应的restartPolicy 为 Never，它不会重新启动。
* Init 容器支持应用容器的全部字段和特性，但不支持 Readiness Probe，因为它们必须在 Pod 就绪之前运行完成。
* 如果为一个 Pod 指定了多个 Init 容器，那些容器会按顺序一次运行一个。 每个 Init 容器必须运行成功，下一个才能够运行。
* 因为 Init 容器可能会被重启、重试或者重新执行，所以 Init 容器的代码应该是幂等的。 特别地，被写到EmptyDirs 中文件的代码，应该对输出文件可能已经存在做好准备。
* 在 Pod 上使用 activeDeadlineSeconds，在容器上使用 livenessProbe，这样能够避免 Init 容器一直失败。这就为 Init 容器活跃设置了一个期限。但建议仅在团队将其应用程序部署为 Job 时才使用 activeDeadlineSeconds，因为 activeDeadlineSeconds 在 Init 容器结束后仍有效果。如果你设置了 activeDeadlineSeconds，已经在正常运行的 Pod 会被杀死。
* 在 Pod 中的每个 app 和 Init 容器的名称必须唯一；与任何其它容器共享同一个名称，会在验证时抛出错误。
* 对 Init 容器 spec 的修改，被限制在容器 image 字段中。 更改 Init 容器的 image 字段，等价于重启该 Pod。

## 静态pod

所谓静态pod就是，不是master上创建的，而是需要到Node的/etc/kubelet.d/里创建一个yaml文件，然后根据这个yaml文件，创建一个pod，这样创建出来的node，是不会接受master的管理的。

当然，要是想创建静态pod的话，需要对node的kubelet配置文件进行一些设置才可以。在指定目录下面创建一个yaml文件，然后改kubelet的systemd配置，reload+重启，检查下

### 创建步骤

在node上
```bash
systemctl status kubelet
```
找到`--pod-manifest-path`所对应的目录

在里面创建一个文件

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: static-web
  labels:
    role: myrole
spec:
  containers: 
  - name: web
    image: nginx
    ports: 
    - name: web
      containerPort: 80
      protocol: TCP
```
