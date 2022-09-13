## 1.下载Istio发行版

[下载指引](https://istio.io/latest/zh/docs/setup/getting-started/#download)

```
#下载指定版本，国内可能会因为网络问题无法下载
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.15.0 TARGET_ARCH=x86_64 sh -
#github链接
#https://github.com/istio/istio/releases/download/1.15.0/istio-1.15.0-linux-amd64.tar.gz
```

## 2.安装

在安装 Istio 时使用内置配置文件。这些配置文件提供了对 Istio 控制平面和 Istio 数据平面 Sidecar 的定制内容。

您可以从 Istio 内置配置文件的其中一个开始入手，然后根据您的特定需求进一步自定义配置文件。当前提供以下几种内置配置文件：

default：根据 IstioOperator API 的默认设置启动组件。 建议用于生产部署和 Multicluster Mesh 中的 Primary Cluster。
您可以运行 istioctl profile dump 命令来查看默认设置。

demo：这一配置具有适度的资源需求，旨在展示 Istio 的功能。 它适合运行 Bookinfo 应用程序和相关任务。 这是通过快速开始指导安装的配置。

此配置文件启用了高级别的追踪和访问日志，因此不适合进行性能测试。
minimal：与默认配置文件相同，但只安装了控制平面组件。 它允许您使用 Separate Profile 配置控制平面和数据平面组件(例如 Gateway)。

remote：配置 Multicluster Mesh 的 Remote Cluster。
empty：不部署任何东西。可以作为自定义配置的基本配置文件。

preview：预览文件包含的功能都是实验性。这是为了探索 Istio 的新功能。不确保稳定性、安全性和性能（使用风险需自负）。

```
istioctl install --set profile=demo -y
✔ Istio core installed                                                           
✔ Istiod installed
✔ Egress gateways installed
✔ Ingress gateways installed
✔ Installation complete
Making this installation the default for injection and validation.

Thank you for installing Istio 1.15.  Please take a few minutes to tell us about your install/upgrade experience!  https://forms.gle/SWHFBmwJspusK1hv6
```

## 3.为工作负载注入sidecar
  
```
istioctl kube-inject -f pod1.yaml | kubectl apply -f -
#为命名空间自动注入
kubectl label ns ns1 istio-injection=enabled
```

## 4.安装观测面板
```
安装kiali
kubectl apply -f istio-1.15.0/samples/addons/
```