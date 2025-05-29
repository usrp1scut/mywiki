## 查看所有虚机
```bash
virsh list --all
```
## 在线加硬盘

```bash
qemu-img create -f qcow2 -o size=1000G /opt/kvm/image/kvm-vm4-02-1T.qcow2
virsh attach-disk --domain kvm-vm4 --source /opt/kvm/image/kvm-vm4-02-1T.qcow2 --target vdb --targetbus virtio --driver qemu --subdriver qcow2 --sourcetype file --cache none --persistent
```

## CPU内存热扩

```bash
virsh setmem vm-name xxxxM
virsh setvcpus vm-name 16
```

## KVM虚拟机缺少指令集

默认KVM配置未能使用所有CPU指令集，需要修改配置文件

### 修改KVM CPU MODE配置
先关闭虚拟机

一般配置路径在`/etc/libvirt/qemu/XXX.xml`

custom自己定义（默认）；

host-model（根据物理CPU的特性，选择一个最靠近的标准CPU型号，如果没有指定CPU模式，默认这种模式）；

host-passthrough（直接将物理CPU 暴露给虚拟机使用，在虚拟机上完全可以看到的就是物理CPU的型号）；

三种mode的性能排序是：host-passthrough>host-model>custom三种mode的热迁移通用性是：custom>host-model>host-passthrough

修改xml中的CPU mode配置

修改为host-model模式，会根据宿主机的CPU使用接近的虚拟机CPU类型，解锁更多宿主机的指令集，如果仍然缺少则选择host-passthrough模式直通宿主机CPU,但影响迁移兼容性


```xml
  <cpu mode='host-model' check='partial'>
    <model fallback='allow'/>
    <topology sockets='2' cores='8' threads='2'/>
  </cpu>
```

### 应用并启动
```bash
virsh define vmconfig.xml
virsh start vm-name

```