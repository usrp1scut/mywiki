## 节点过滤
### 节点过滤的条件参数
```
NoDiskConflict
PodFitsResources
PodFitsPorts
MatchNodeSelector
HostName
NoVolumeZoneConflict
PodToleratesNodeTaints
CheckNodeMemoryPressure
CheckNodeDiskPressure
MaxEBSVolumeCount
MaxGCEPDVolumeCount
MaxAzureDiskVolumeCount
MatchInterPodAffinity
GeneralPredicates
NodeVolumeNodeConflict
```

### 使用nodeSelector调度到含有特定标签的节点

1.为节点添加标签

```bash
kubectl label nodes <your-node-name> disktype=ssd
```

2.验证你选择的节点确实带有 disktype=ssd 标签：

```bash
kubectl get nodes --show-labels
```

3.创建一个将被调度到你选择的节点的 Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    env: test
spec:
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
  nodeSelector:
    disktype: ssd
```

### 指定节点名称

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  nodeName: foo-node # 调度 Pod 到特定的节点
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
```

### 节点亲和性

* requiredDuringSchedulingIgnoredDuringExecution： 调度器只有在规则被满足的时候才能执行调度。此功能类似于 nodeSelector， 但其语法表达能力更强。
* preferredDuringSchedulingIgnoredDuringExecution： 调度器会尝试寻找满足对应规则的节点。如果找不到匹配的节点，调度器仍然会调度该 Pod。

你可以使用 operator 字段来为 Kubernetes 设置在解释规则时要使用的逻辑操作符。 你可以使用 In、NotIn、Exists、DoesNotExist、Gt 和 Lt 之一作为操作符。


#### 强制节点亲和性

下面清单描述了一个 Pod，它有一个节点亲和性配置 requiredDuringSchedulingIgnoredDuringExecution，disktype=ssd。 这意味着 pod 只会被调度到具有 disktype=ssd 标签的节点上。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd            
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
```

#### 首选节点亲和性

本清单描述了一个Pod，它有一个节点亲和性设置 preferredDuringSchedulingIgnoredDuringExecution，disktype: ssd。 这意味着 pod 将首选具有 disktype=ssd 标签的节点。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd          
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
```

你可以为 preferredDuringSchedulingIgnoredDuringExecution 亲和性类型的每个实例设置 weight 字段，其取值范围是 1 到 100。 当调度器找到能够满足 Pod 的其他调度请求的节点时，调度器会遍历节点满足的所有的偏好性规则， 并将对应表达式的 weight 值加和。

最终的加和值会添加到该节点的其他优先级函数的评分之上。 在调度器为 Pod 作出调度决定时，总分最高的节点的优先级也最高。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-affinity-anti-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values:
            - linux
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: label-1
            operator: In
            values:
            - key-1
      - weight: 50
        preference:
          matchExpressions:
          - key: label-2
            operator: In
            values:
            - key-2
  containers:
  - name: with-node-affinity
    image: registry.k8s.io/pause:2.0
```

如果存在两个候选节点，都满足 preferredDuringSchedulingIgnoredDuringExecution 规则， 其中一个节点具有标签 label-1:key-1，另一个节点具有标签 label-2:key-2， 调度器会考察各个节点的 weight 取值，并将该权重值添加到节点的其他得分值之上.

### Pod 间亲和性与反亲和性

Pod 间亲和性与反亲和性使你可以基于已经在节点上运行的 Pod 的标签来约束 Pod 可以调度到的节点，而不是基于节点上的标签。

Pod 间亲和性与反亲和性的规则格式为“如果 X 上已经运行了一个或多个满足规则 Y 的 Pod， 则这个 Pod 应该（或者在反亲和性的情况下不应该）运行在 X 上”。 这里的 X 可以是节点、机架、云提供商可用区或地理区域或类似的拓扑域， Y 则是 Kubernetes 尝试满足的规则。

你通过标签选择算符 的形式来表达规则（Y），并可根据需要指定选关联的名字空间列表。 Pod 在 Kubernetes 中是名字空间作用域的对象，因此 Pod 的标签也隐式地具有名字空间属性。 针对 Pod 标签的所有标签选择算符都要指定名字空间，Kubernetes 会在指定的名字空间内寻找标签。

你会通过 topologyKey 来表达拓扑域（X）的概念，其取值是系统用来标示域的节点标签键。 相关示例可参见常用标签、注解和污点。

与节点亲和性类似，Pod 的亲和性与反亲和性也有两种类型：

* `requiredDuringSchedulingIgnoredDuringExecution`
* `preferredDuringSchedulingIgnoredDuringExecution`

例如，你可以使用 requiredDuringSchedulingIgnoredDuringExecution 亲和性来告诉调度器， 将两个服务的 Pod 放到同一个云提供商可用区内，因为它们彼此之间通信非常频繁。 类似地，你可以使用 preferredDuringSchedulingIgnoredDuringExecution 反亲和性来将同一服务的多个 Pod 分布到多个云提供商可用区中。

要使用 Pod 间亲和性，可以使用 Pod 规约中的 .affinity.podAffinity 字段。 对于 Pod 间反亲和性，可以使用 Pod 规约中的 .affinity.podAntiAffinity 字段。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: with-pod-affinity
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: security
            operator: In
            values:
            - S1
        topologyKey: topology.kubernetes.io/zone
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: security
              operator: In
              values:
              - S2
          topologyKey: topology.kubernetes.io/zone
  containers:
  - name: with-pod-affinity
    image: registry.k8s.io/pause:2.0
```

亲和性规则表示，仅当节点和至少一个已运行且有` security=S1 `的标签的 Pod 处于同一区域时，才可以将该 Pod 调度到节点上。 更确切的说，调度器必须将 Pod 调度到具有` topology.kubernetes.io/zone=V `标签的节点上，并且集群中至少有一个位于该可用区的节点上运行着带有` security=S1 `标签的 Pod。

反亲和性规则表示，如果节点处于 Pod 所在的同一可用区且至少一个 Pod 具有` security=S2 `标签，则该 Pod 不应被调度到该节点上。 更确切地说， 如果同一可用区中存在其他运行着带有` security=S2 `标签的 Pod 节点， 并且节点具有标签` topology.kubernetes.io/zone=R`，Pod 不能被调度到该节点上。

#### 使用场景

下例的 Deployment 为 Web 服务器创建带有标签 app=web-store 的副本。 Pod 亲和性规则告诉调度器将每个副本放到存在标签为 app=store 的 Pod 的节点上。 Pod 反亲和性规则告诉调度器决不要在单个节点上放置多个 app=web-store 服务器。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-server
spec:
  selector:
    matchLabels:
      app: web-store
  replicas: 3
  template:
    metadata:
      labels:
        app: web-store
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - web-store
            topologyKey: "kubernetes.io/hostname"
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - store
            topologyKey: "kubernetes.io/hostname"
      containers:
      - name: web-app
        image: nginx:1.16-alpine
```

下例的 Deployment 为 Web 服务器创建带有标签 app=web-store 的副本。 Pod 亲和性规则告诉调度器将每个副本放到存在标签为 app=store 的 Pod 的节点上。 Pod 反亲和性规则告诉调度器决不要在单个节点上放置多个 app=web-store 服务器。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-server
spec:
  selector:
    matchLabels:
      app: web-store
  replicas: 3
  template:
    metadata:
      labels:
        app: web-store
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - web-store
            topologyKey: "kubernetes.io/hostname"
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - store
            topologyKey: "kubernetes.io/hostname"
      containers:
      - name: web-app
        image: nginx:1.16-alpine
```

创建前面两个 Deployment 会产生如下的集群布局，每个 Web 服务器与一个缓存实例并置， 并分别运行在独立的节点上。

|  node-1   | node-2  |
|  ----  | ----  |
| webserver-1  | webserver-2 |
| cache-1 | cache-2 |