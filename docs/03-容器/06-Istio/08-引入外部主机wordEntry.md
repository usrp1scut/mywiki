## 与节点同局域网的外部主机添加去往容器网段的路由，并安装sidecar

```bash
route add -net 10.244.0.0 gw 192.168.26.81 netmask 255.255.0.0
#Debian、Ubuntu
wget https://storage.googleapis.com/istio-release/releases/1.15.0/deb/istio-sidecar.deb
dpkg -i istio-sidecar.deb
#RedHat\Centos\Rocky
https://storage.googleapis.com/istio-release/releases/1.15.0/rpm/istio-sidecar.rpm
rpm -ivh istio-sidecar.deb
```
## 创建workloadGroup

mywg.yaml
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: WorkloadGroup
metadata:
  name: mywg
  namespace: ns1
spec:
  metadata:
    annotations: {}
    labels:
      app: test
  template:
    ports: {}
    serviceAccount: default
```

生成外部主机安装所需要的文件

```
mkdir 11
istioctl x workload entry configure -f mywg.yaml -o 11
```

生成的目录11内的文件全部拷贝到主机

## 主机操作

```bash
#在虚拟机上安装根证书
mkdir -p /etc/certs
cp 11/root-cert.pem /etc/certs/root-cert.pem
#安装令牌
mkdir -p /var/run/secrets/tokens
cp 11/istio-token /var/run/secrets/tokens/istio-token
cp 11/cluster.env /var/lib/istio/envoy/cluster.env
#将网格配置安装到/etc/istio/config/mesh
cp 11/mesh.yaml /etc/istio/config/mesh
mkdir -p /etc/istio/proxy
chown -R istio-proxy /var/lib/istio /etc/certs /etc/istio/proxy /etc/istio/config /var/run/secrets /etc/certs/root-cert.pem
#修改/etc/hosts
10.244.186.141 istiod.istio-system.svc   #istiod pod的IP

#启动istio
systemctl start istio

```

## 集群创建workloadEntry及svc
```yaml
apiVersion: networking.istio.io/v1beta1
kind: WorkloadEntry
metadata:
  name: gitlab
  namespace: ns1
spec:
  serviceAccount: default
  address: 192.168.26.60    #主机IP
  labels:
    app: gitlab
    instance-id: vms60
---
apiVersion: v1
kind: Service
metadata:
  name: vm-svc
  namespace: ns1
  labels:
    app: gitlab
spec:
  ports:
  - port: 80
    name: http-vm
    targetPort: 80
  selector:
    app: gitlab
```
## 最后可以通过gateway和VS将svc对外发布，详见[VS流量管理](https://xiebo.pro/docs/Istio/VS%E6%B5%81%E9%87%8F%E7%AE%A1%E7%90%86)章节