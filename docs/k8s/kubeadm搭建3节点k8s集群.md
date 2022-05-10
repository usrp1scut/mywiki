* 系统为Ubuntu20.04
## 所有节点执行
### 1.配置软件源，复制如下内容，替换/etc/apt/sources.list的内容
```
deb http://mirrors.aliyun.com/ubuntu focal main restricted
deb http://mirrors.aliyun.com/ubuntu focal-updates main restricted
deb http://mirrors.aliyun.com/ubuntu focal universe
deb http://mirrors.aliyun.com/ubuntu focal-updates universe
deb http://mirrors.aliyun.com/ubuntu focal multiverse
deb http://mirrors.aliyun.com/ubuntu focal-updates multiverse
deb http://mirrors.aliyun.com/ubuntu focal-backports main restricted universe multiverse
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
deb http://mirrors.aliyun.com/ubuntu focal-security main restricted
deb http://mirrors.aliyun.com/ubuntu focal-security universe
deb http://mirrors.aliyun.com/ubuntu focal-security multiverse
deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable
```
* 然后执行

`curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add - ; apt-get update`
### 2.配置系统
* 配置/etc/hosts，写上所有节点主机名及IP
```
192.168.1.1 node1.k8s k8s-node1
192.168.1.2 node2.k8s k8s-node2
192.168.1.3 node3.k8s k8s-node3
```
* 关闭swap
```
swapoff -a
vi /etc/fstab #注释挂载swap的行
```
* 修改内核参数
```
cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
```
`sysctl -p`
* 安装docker
```
apt-get install -y docker-ce
systemctl enable docker --now #启动docker并设置开机自动
```
* 设置镜像加速
```
cat > /etc/docker/daemon.json <<EOF
{ 
  "registry-mirrors": ["https://frz7i079.mirror.aliyuncs.com"]
}
EOF
```
* 导入coredns、calico、metrics和nginx-ingress-controller镜像，网盘内有
```
docker load -i xx-img.tar
```
* 安装kubernetes相关软件包,并启动kubelet
```
apt-get install -y kubeadm=1.21.0-00 kubelet=1.21.0-00 kubectl=1.21.0-00
systemctl restart kubelet ; systemctl enable kubelet
```
## master节点执行
### 3.安装master
```
kubeadm init --image-repository registry.aliyuncs.com/google_containers --kubernetes-version=v1.20.1 --pod- network-cidr=10.244.0.0/16
```
安装完成后根据提示执行配置文件和目录配置
### 4.安装calico网络组件
```
sed -i 's/192.168.0.0/10.244.0.0/g' calico_v3.14.yaml
kubectl apply -f calico_v3.14.yaml
```
* 设置可以用tab补齐键 
```
vim /etc/profile
source <(kubectl completion bash)
source /etc/profile
```
## worker节点执行
```
kubeadm join IP:6443 --token TOKEN  #从master复制，可以通过kubeadm token create --print-join-command 查看
```
### 到这里基础集群已经搭建配置完成，需要Loadbalancer svc可安装[metallb](https://metallb.universe.tf/)，ingress可安装nginx-controller