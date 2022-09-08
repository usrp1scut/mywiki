[原文链接 ...](https://www.jianshu.com/p/9d6c82baf065)

如果服务器提供TCP服务（TCP层或者HTTP层），在并发访问量持续很高时，容易产生too many open files错误。这时查看netstat可以发现很多TIME_WAIT状态的链接，这说明大量链接处于半开状态，已经完成了请求响应，并且进入了TCP关闭的四步握手。按照TCP协议要求，在这里需要等待一段时间（两个MSL时间）才能完全释放该链接。每一个TCP链接对应一个文件句柄（即算作一个打开的文件），这就导致进程打开的TCP链接很容易超过允许的最大文件打开数。这时，就需要按照业务要求增加允许的最大打开文件数来增加系统容量。对于Linux来讲，最大打开文件数的设置有两个地方。

对于too many open files错误，除了增加打开文件数，还有许多其它的优化办法，比如减少TIME_WAIT状态的时间等。本文只介绍如何修改最大打开文件数的限制，因为Linux默认的打开文件数实在太小（1024），其它方法请自行百度或者谷歌。

### 1. 系统级（内核）
系统级设置对所有用户有效。可通过两种方式查看系统最大打开文件数限制。

方法一，运行
```
cat /proc/sys/fs/file-max
```
方法二，运行
```
sysctl -a
```
查看结果中fs.file-max这个属性的值。

如果需要修改系统允许的打开文件数量就修改/etc/sysctl.conf文件，配置fs.file-max的值，如果属性不存在就添加。

配置完成后运行
```
sysctl -p
```
来通知系统启用这项配置。

### 2. 用户级
除了系统级别的限制，Linux还限制每个登录用户的可打开文件数（root用户不受此限制）。可通过
```
ulimit -n
```
来查看当前登录用户的有效设置。

如果你是普通用户，只想暂时的修改打开文件数，可以直接使用shell命令
```
ulimit -n 1024000
```
但是这个设置是暂时的保留！当你退出Shell会话后，该值恢复原值。

如果要永久修改ulimit，需要修改/etc/security/limits.conf。
```
vim /etc/security/limits.conf
```
添加如下的行
```
*  soft nofile 2048

*  hard nofile 2048
```
或者
```
* - nofile 2048 （这个是同时设置soft和hard的值）
```
以下是设置说明：

*代表针对所有用户

noproc是代表最大进程数

nofile是代表最大文件打开数

添加格式：

[username | @groupname] type resource limit

[username | @groupname]：设置需要被限制的用户名，组名前面加@和用户名区别。也可以用通配符*来做所有用户的限制。

type：有soft，hard和-，soft指的是当前系统生效的设置值。hard表明系统中所能设定的最大值。soft的限制不能比hard限制高。用-就表明同时设置了soft和hard的值。

支持设置的resource：

core -限制内核文件的大小(kb)

date -最大数据大小(kb)

fsize -最大文件大小(kb)

memlock -最大锁定内存地址空间(kb)

nofile -打开文件的最大数目

rss -最大持久设置大小(kb)

stack -最大栈大小(kb)

cpu -以分钟为单位的最多CPU时间

noproc -进程的最大数目

as -地址空间限制

maxlogins -此用户允许登录的最大数目

示例：
```
username soft nofile 2048

username hard nofile 2048

@groupname soft nofile 2048

@groupname hard nofile 2048
```
### 3. 查看进程的打开文件
查看某个进程的打开文件数限制：
```
cat /proc//limits
```
查看某个进程的打开文件描述符列表：
```
ls -l /proc//fd
```
