# PVE 8 安装 ReakTEK RTL8125B 2.5G网卡驱动
### [原文链接~](https://evine.win/p/pve-install-realtek-8125-driver/)
*  RealTEK RTL8125 2.5GB 网卡默认加载的驱动是r8169，会出现掉速不稳定情况
```bash
## 看看网卡的pci编号
lspci | grep RTL8125 
```
```
01:00.0 Ethernet controller: Realtek Semiconductor Co., Ltd. RTL8125 2.5GbE Controller (rev 05)
02:00.0 Ethernet controller: Realtek Semiconductor Co., Ltd. RTL8125 2.5GbE Controller (rev 05)
```
```bash
## 查看网卡加载的驱动
lspci -s 01:00.0 -k
lspci -s 02:00.0 -k
```
已经有大佬把官方驱动打包成了dkms deb包：https://github.com/awesometic/realtek-r8125-dkms，不过该deb包并没有打开网卡多队列，另外一位大佬打了个，启用了TX多队列及RSS，禁用ASPM，发布在：https://github.com/devome/r8125-dkms ，直接使用即可。先下载Release中最新的deb文件，再按下方流程安装即可：

```bash
## 更新内核、安装依赖
$ apt update
$ apt upgrade
$ apt install -y dkms pve-headers #pve 8.0.4+建议将pve-headers替换为proxmox-default-headers

## 安装headers
$ headers=$(dpkg -l | awk '/^ii.+kernel-[0-9]+\.[0-9]+\.[0-9]/{gsub(/-signed/, ""); gsub(/kernel/, "headers"); print $2}' | tr "\n" " ")
$ eval apt install -y $headers

## 安装刚刚下载好的deb包，此命令只会为当前系统所使用的内核以及刚刚安装的最新内核（也可能当前所使用的内核就是最新内核）安装驱动
$ dpkg -i r8125-dkms_*.deb  # 如通配符会匹配多个时亦可指定具体的文件名

## 如果想为那些既不是系统当前所使用的内核，也不是刚刚安装的最新内核安装驱动，需要手动指定安装
## 看看哪些内核安装好了驱动
$ dkms status
## 列出全部内核版本kernel_version，找出那些还没有安装驱动的内核
$ dpkg -l | awk '/^ii.+kernel-[0-9]+\.[0-9]+\.[0-9]/{gsub(/proxmox-kernel-|pve-kernel-|-signed/, ""); print $2}'
## 手动指定驱动版本（在deb文件名中有体现）和内核版本（从上一句命令的输出中），zsh按tab可自动补全，比如：dkms install r8125/9.011.01 -k 6.2.16-5-pve
$ dkms install r8125/<driver_version> -k <kernel_version>

## 卸载不再需要的headers
$ eval apt-mark auto $headers
$ apt autopurge

## 禁用r8169驱动
$ echo "blacklist r8169" >> /etc/modprobe.d/dkms.conf

## 重启
$ update-grub
$ update-initramfs -u -k all
$ reboot

## 再次查看网卡加载的驱动，现在加载的是r8125了
$ lspci -s 02:00.0 -k
02:00.0 Ethernet controller: Realtek Semiconductor Co., Ltd. RTL8125 2.5GbE Controller (rev 05)
        Subsystem: Realtek Semiconductor Co., Ltd. RTL8125 2.5GbE Controller
        Kernel driver in use: r8125
        Kernel modules: r8169, r8125

```